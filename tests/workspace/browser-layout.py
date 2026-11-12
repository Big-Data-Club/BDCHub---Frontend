"""Owned local app only. Start isolated service/Next and prepare-browser.mjs first."""
import json, os, re, sys, time, base64
from urllib.parse import quote
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
sys.stdout.reconfigure(encoding='utf-8')
artifacts=Path(os.environ['WORKSPACE_TEST_ARTIFACTS'])
actors=json.loads((artifacts/'browser-sessions.json').read_text())
base='http://localhost:3100'
with sync_playwright() as p:
    executable=os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE') or (r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe' if os.name=='nt' else None)
    browser=p.chromium.launch(headless=True,executable_path=executable)
    contexts=[]; errors=[]
    expect.set_options(timeout=30000)
    def actor(index, viewport=None):
        production=os.environ.get('WORKSPACE_TEST_PRODUCTION')=='1'
        cookie_name='__Secure-bdc.session-token.v2' if production else 'bdc.session-token.v2'
        context=browser.new_context(viewport=viewport or {'width':1440,'height':1000},extra_http_headers={'Cookie':cookie_name+'='+actors[index]['cookie']} if production else {})
        context.add_cookies([{'name':cookie_name,'value':actors[index]['cookie'],'domain':'localhost','path':'/','httpOnly':True,'sameSite':'Lax','secure':production}])
        contexts.append(context)
        # The global BDC shell also calls unrelated services; isolate those only.
        context.route('**/api/ai/agents/notifications',lambda route:route.fulfill(json={'notifications':[],'unread_count':0}))
        context.route('**/lmsapiv1/me/roles',lambda route:route.fulfill(json={'roles':['STUDENT']}))
        context.route('**/apiv1/api/users/*',lambda route:route.fulfill(json={'id':int(actors[index]['id']),'name':actors[index]['name'],'role':'ROLE_MEMBER'}))
        context.add_init_script("window.__runtimeErrors=[];window.addEventListener('error',e=>window.__runtimeErrors.push({message:e.message,file:e.filename,line:e.lineno,column:e.colno}));")
        page=context.new_page();page.on('pageerror',lambda error:errors.append({'url':page.url,'stack':error.stack}))
        return context,page
    alice,a=actor(0);bob,b=actor(1);eve,e=actor(2)
    def api(context,path,method='GET',data=None):
        response=context.request.fetch(base+'/api/workspace'+path,method=method,data=data,headers={'Origin':base})
        assert response.ok, (path,response.status,response.text())
        return response.json()

    home=api(alice,'/bootstrap');space=next(x for x in home['spaces'] if x['kind']=='personal')
    page=api(alice,'/spaces/'+space['id']+'/pages','POST',{'title':'Màu trên điện thoại'})
    a.set_viewport_size({'width':390,'height':844});a.goto(base+'/workspace?page='+page['id'],wait_until='networkidle',timeout=90000)
    editor=a.locator('.bn-editor');expect(editor).to_be_visible();editor.click();a.keyboard.insert_text('Kiểm tra bảng màu')
    editor.locator('[data-content-type="paragraph"]').first.hover();a.wait_for_timeout(400);a.get_by_role('button',name='Mở trình đơn khối',exact=True).click()
    a.get_by_role('menuitem',name='Màu chữ & nền',exact=True).hover();colors=a.locator('.bn-color-picker-dropdown:visible');expect(colors).to_be_visible()
    a.wait_for_timeout(500)
    box=colors.bounding_box();print('Mobile color bounds:',box,flush=True);assert box['x']>=0 and box['x']+box['width']<=390 and box['y']>=0 and box['y']+box['height']<=844,box
    a.screenshot(path=str(artifacts/'recycle-colors-mobile.png'),full_page=True)
    a.goto(base+'/workspace/guide',wait_until='networkidle')
    expect(a.get_by_text('/page hoặc chọn Trang con trong trình đơn thêm khối',exact=False)).to_be_visible()
    a.get_by_role('link',name='Thư viện công thức',exact=True).click()
    expect(a.get_by_role('heading',name='Thư viện công thức',exact=True)).to_be_visible()
    assert not errors,errors
    print('PASS: mobile color menu stays within viewport and final guide matches the available controls.',flush=True)
    browser.close()
