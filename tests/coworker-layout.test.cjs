const { test } = require("node:test");
const path = require("node:path");
const { chromium, expect } = require("@playwright/test");

// Exercise the real shell and resize hook, without authentication/API dependencies.
test("Coworker splits, resizes and switches compact views without remounting content", { timeout: 120000 }, async () => {
  const { createServer, transformWithEsbuild } = await import("vite");
  const root = path.resolve(__dirname, "..");
  const stubs = {
    "next/dynamic": `import React from 'react'; export default (load, options) => {
      const Component = React.lazy(async () => ({ default: await load() }));
      return props => React.createElement(React.Suspense, { fallback: options.loading() }, React.createElement(Component, props));
    };`,
    "next-auth/react": `export const useSession = () => ({status:'authenticated'});`,
    "@/lib/tenant/navigation": `export const usePathname = () => '/lms/student/courses/27/learn'; export const useParams=()=>({courseId:'27'});`,
    "sonner": `export const toast={info:()=>{}};`,
    "@/hooks/auth/useAuth": `const user={role:'ROLE_USER'}; export const useAuth=()=>({user});`,
    "@/hooks/common/usePageContext": `export const usePageContext=()=>null;`,
    "@/components/layout/Sidebar": `import React from 'react'; export default () => React.createElement('div', {'data-testid':'sidebar',style:{width:80,height:'100%'}});`,
    "@/components/layout/MobileNav": `import React from 'react'; export default () => React.createElement('div', {'data-testid':'mobile-nav'}, 'Navigation');`,
    "@/components/layout/Footer": `export default () => null;`,
    "@/components/lms/shared": `export {LmsPageHeader} from '/src/components/lms/shared/LmsPageHeader.tsx'; export const PageLoader=()=>null; export const NavTabBar=()=>null;`,
    "@/components/lms/shared/BreadcrumbNav": `export const BreadcrumbNav=()=>null;`,
    "@/components/lms/student/CourseDetailProgressCard": `import React from 'react'; export const CourseDetailProgressCard=()=>React.createElement('div',{'data-testid':'progress'},'Progress');`,
    "@/components/user/UserAvatar": `export const UserAvatar=()=>null;`,
    "@/features/notebook/CourseNotebookContext": `export const useCourseNotebook=()=>null; export const CourseNotebookProvider=({children})=>children;`,
    "@/features/notebook/components/CourseNotebookSidebar": `export const CourseNotebookSidebar=()=>null;`,
    "@/components/lms/student/StudentCourseProviders": `
      import React from 'react';
      import {StudentCourseContext} from '/src/components/lms/student/StudentCourseContext.tsx';
      const sections=Array.from({length:40},(_,index)=>({id:index+1,title:'Chapter '+(index+1)}));
      const sectionContents=Object.fromEntries(sections.map(s=>[s.id,[{id:s.id,section_id:s.id,title:'Lesson '+s.id,type:'TEXT'}]]));
      const expanded=new Set(sections.map(s=>s.id));
      export function StudentCourseProviders({children}){
        const [sidebarOpen,setSidebarOpen]=React.useState(false);
        const [activeContent,setActiveContent]=React.useState(null);
        return React.createElement(StudentCourseContext.Provider,{value:{
          course:{id:27,title:'Course with a PDF lesson'},sections,sectionContents,coTeachers:[],
          completedIds:new Set(),progress:null,loadingSection:{},expanded,toggleSection:()=>{},
          sidebarOpen,setSidebarOpen,activeContent,setActiveContent:item=>{setActiveContent(item);setSidebarOpen(false)}
        }},children);
      }`,
    "../lms/agent/AgentChatPanel": `import React from 'react';
      import {ChatModeSelector} from '/src/components/lms/agent/ChatModeSelector.tsx';
      export function AgentChatPanel() {
      React.useEffect(()=>{window.metrics.chatMounts++}, []);
      window.metrics.chatRenders++;
      const [mode,setMode]=React.useState('standard');
      return React.createElement('div',null,
        React.createElement(ChatModeSelector,{className:'mode-selector',currentMode:mode,onModeChange:setMode}),
        React.createElement('textarea', {'aria-label':'Chat draft',style:{width:'100%',height:100}}));
    }`,
    "../lms/agent/AgentNotebookPanel": `export const AgentNotebookPanel = () => null;`,
  };
  const entry = `
    import React from 'react';
    import {createRoot} from 'react-dom/client';
    import {CoworkerLayout} from '/src/components/layout/CoworkerLayout.tsx';
    import LmsContextShell from '/src/app/(learning)/lms/LmsContextShell.tsx';
    import CourseLayout from '/src/app/(learning)/lms/student/courses/[courseId]/layout.tsx';
    import '/src/app/globals.css';
    window.metrics={chatMounts:0,chatRenders:0,pageMounts:0,iframeLoads:0,widthWrites:0};
    const write=Storage.prototype.setItem;
    Storage.prototype.setItem=function(key,value){if(key==='bdc_coworker_width')window.metrics.widthWrites++;return write.call(this,key,value)};
    function Content(){
      React.useEffect(()=>{window.metrics.pageMounts++},[]);
      return <LmsContextShell><CourseLayout>
        <textarea aria-label="Lesson draft"/>
        <iframe title="PDF demo" srcDoc="<p>PDF preview</p>" onLoad={()=>{window.metrics.iframeLoads++}} style={{width:'100%',height:500}}/>
        <button>Read lesson</button><div style={{height:1500}}>Lesson content</div>
      </CourseLayout></LmsContextShell>;
    }
    createRoot(document.getElementById('root')).render(<CoworkerLayout><Content/></CoworkerLayout>);
  `;
  const server = await createServer({
    root, configFile: false, cacheDir: "/tmp/bdc-coworker-vite-cache",
    resolve: { alias: [
      ...Object.keys(stubs).map((find, index) => ({
        find: new RegExp("^" + find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$"),
        replacement: `/coworker-stub-${index}.js`,
      })),
      { find: "@", replacement: path.join(root, "src") },
    ] },
    optimizeDeps: { noDiscovery: true, include: ["react", "react-dom/client", "react/jsx-runtime", "react/jsx-dev-runtime", "@radix-ui/react-dialog"] },
    esbuild: { jsx: "automatic" },
    server: { host: "127.0.0.1", port: 0, hmr: false },
    plugins: [{
      name: "coworker-test-fixture",
      resolveId(id) {
        if (/^\/coworker-stub-\d+\.js$/.test(id)) return "\0" + id;
        if (id === "/coworker-fixture.tsx") return id;
      },
      async load(id) {
        const stub = id.match(/^\0\/coworker-stub-(\d+)\.js$/);
        if (stub) return Object.values(stubs)[Number(stub[1])];
        if (id === "/coworker-fixture.tsx") return (await transformWithEsbuild(entry, id, { loader: "tsx", jsx: "automatic" })).code;
      },
      configureServer(vite) {
        vite.middlewares.use("/coworker-test", (_req, res) => {
          res.setHeader("Content-Type", "text/html");
          res.end('<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="/coworker-fixture.tsx"></script></body></html>');
        });
      },
    }],
  });
  let browser;
  try {
    await server.listen();
    const base = `http://127.0.0.1:${server.httpServer.address().port}/coworker-test`;
    browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on("pageerror", (error) => console.error(error.stack));
    await page.goto(base);
    const trigger = page.getByRole("button", { name: "AI Cowork", exact: true });
    const panel = page.getByRole("complementary", { name: "AI Cowork" });
    await expect(trigger).toBeVisible();
    await expect(page.getByText("Nội dung khóa học", { exact: true })).toBeVisible();
    await page.getByRole("textbox", { name: "Lesson draft" }).fill("Keep my lesson");
    await trigger.click();
    await expect(panel).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Lesson draft" })).toBeVisible();
    await expect(page.getByText("Nội dung khóa học", { exact: true })).toBeHidden();
    const titleBox = await page.getByRole("heading", { name: "Course with a PDF lesson" }).boundingBox();
    const progressBox = await page.getByTestId("progress").boundingBox();
    expect(progressBox.y).toBeGreaterThanOrEqual(titleBox.y + titleBox.height);
    const modes = page.locator(".mode-selector");
    const modeHeight = (await modes.boundingBox()).height;
    for (const name of ["Flash", "Sâu", "Chuẩn"]) {
      await page.getByRole("button", { name, exact: true }).click();
      await expect(page.getByRole("button", { name, exact: true })).toHaveAttribute("aria-pressed", "true");
      expect((await modes.boundingBox()).height).toBeLessThanOrEqual(modeHeight + 1);
    }
    const listTrigger = page.getByRole("button", { name: "Danh sách bài học", exact: true });
    await listTrigger.click();
    const drawer = page.getByRole("dialog", { name: "Danh sách bài học", exact: true });
    await expect(drawer).toBeVisible();
    expect(await drawer.evaluate(element => element.parentElement === document.body)).toBe(true);
    const lastLesson = drawer.getByRole("button", { name: /Lesson 40/ });
    await lastLesson.scrollIntoViewIfNeeded();
    await expect(lastLesson).toBeInViewport();
    await lastLesson.click();
    await expect(drawer).toBeHidden();
    await expect(listTrigger).toBeFocused();
    await listTrigger.click();
    await drawer.press("Escape");
    await expect(drawer).toBeHidden();
    await listTrigger.click();
    await page.setViewportSize({ width: 1920, height: 900 });
    await expect(drawer).toBeHidden();
    await expect(page.getByText("Nội dung khóa học", { exact: true })).toBeVisible();
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(listTrigger).toBeVisible();
    await page.getByRole("textbox", { name: "Chat draft" }).fill("Keep my chat");
    const before = await page.evaluate(() => ({ ...window.metrics }));
    const separator = page.getByRole("separator");
    await separator.focus();
    await page.keyboard.press("ArrowLeft");
    await expect(separator).toHaveAttribute("aria-valuenow", "470");
    await page.keyboard.press("Home");
    await expect(separator).toHaveAttribute("aria-valuenow", "320");
    expect(await modes.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
    const bounds = await separator.boundingBox();
    const writesBeforeDrag = await page.evaluate(() => window.metrics.widthWrites);
    const rendersBeforeDrag = await page.evaluate(() => window.metrics.chatRenders);
    await page.mouse.move(bounds.x + bounds.width / 2, 150);
    await page.mouse.down();
    await page.mouse.move(900, 250, { steps: 20 });
    await expect.poll(() => page.evaluate(() => window.metrics.widthWrites)).toBe(writesBeforeDrag);
    expect(await page.evaluate(() => window.metrics.chatRenders)).toBeLessThanOrEqual(rendersBeforeDrag + 1);
    await page.mouse.up();
    await expect(separator).toHaveAttribute("aria-valuenow", "540");
    await expect.poll(() => page.evaluate(() => window.metrics.widthWrites)).toBe(writesBeforeDrag + 1);
    const lessonBox = await page.getByRole("textbox", { name: "Lesson draft" }).boundingBox();
    const panelBox = await panel.boundingBox();
    expect(lessonBox.x + lessonBox.width).toBeLessThanOrEqual(panelBox.x);
    await page.evaluate(() => { document.querySelector('[class*="@container/workspace"]').scrollTop = 500; });
    await page.getByRole("button", { name: "Đóng AI Cowork", exact: true }).click();
    await expect(panel).toBeHidden();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await expect(page.getByRole("textbox", { name: "Chat draft" })).toHaveValue("Keep my chat");
    expect(await page.evaluate(() => document.querySelector('[class*="@container/workspace"]').scrollTop)).toBe(500);
    await separator.focus();
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await trigger.click();
    for (const viewport of [{width:1024,height:768},{width:768,height:900},{width:390,height:844},{width:1440,height:900}]) {
      await page.setViewportSize(viewport);
      await expect(panel).toBeVisible();
      const split = viewport.width >= 1024;
      await expect(page.getByRole("textbox", { name: "Lesson draft", includeHidden: true }))[split ? "toBeVisible" : "toBeHidden"]();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await expect(page.getByRole("textbox", { name: "Lesson draft" })).toHaveValue("Keep my lesson");
    expect(await page.evaluate(() => window.metrics.pageMounts)).toBe(before.pageMounts);
    expect(await page.evaluate(() => window.metrics.chatMounts)).toBe(before.chatMounts);
    expect(await page.evaluate(() => window.metrics.iframeLoads)).toBe(before.iframeLoads);
    // Compact mode is a reversible view switch, with no hidden focusable chat.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "Quay lại nội dung" }).click();
    await expect(page.getByRole("textbox", { name: "Lesson draft" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Chat draft" })).toBeHidden();
    await page.reload();
    await trigger.click();
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(separator).toHaveAttribute("aria-valuenow", "540");
    await page.close();
    const blocked = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await blocked.addInitScript(() => {
      Storage.prototype.getItem = () => { throw new Error("Blocked storage"); };
      Storage.prototype.setItem = () => { throw new Error("Blocked storage"); };
    });
    await blocked.goto(base);
    await blocked.getByRole("button", { name: "AI Cowork", exact: true }).click();
    await expect(blocked.getByRole("complementary", { name: "AI Cowork" })).toBeVisible();
    await blocked.getByRole("separator").press("ArrowLeft");
    await expect(blocked.getByRole("separator")).toHaveAttribute("aria-valuenow", "470");
  } finally {
    await browser?.close();
    await server.close();
  }
});
