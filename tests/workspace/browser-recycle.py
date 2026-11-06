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
    api(alice,'/bootstrap')
    space=api(alice,'/spaces','POST',{'title':'Thùng rác '+str(int(time.time()))})
    field=api(alice,f"/spaces/{space['id']}/fields",'POST',{'title':'Sổ tay dự án','icon':'book','color':'blue','description':'','tags':[]})
    gallery=base+'/workspace?space='+space['id'];root=field['page_id']
    a.goto(base+'/workspace?page='+root,wait_until='networkidle',timeout=120000)
    expect(a.locator('.bn-editor[contenteditable=true]')).to_be_visible(timeout=90000)
    a.evaluate("localStorage.setItem('bdc-theme','dark')");a.reload(wait_until='networkidle')
    editor=a.locator('.bn-editor');expect(editor).to_be_visible(timeout=90000)
    expect(a.get_by_role('button',name='Thu gọn thanh bên',exact=True)).to_have_count(0)
    expect(a.get_by_text(re.compile('Cập nhật [0-9]'))).to_have_count(0)
    editor.click();a.keyboard.insert_text('Bảng màu và thao tác khối')
    editor.locator('[data-content-type="paragraph"]').first.hover();a.wait_for_timeout(400)
    a.get_by_role('button',name='Mở trình đơn khối',exact=True).click()
    delete=a.get_by_role('menuitem',name='Xóa khối',exact=True)
    expect(delete.locator('svg')).to_have_count(1)
    a.get_by_role('menuitem',name='Màu chữ & nền',exact=True).hover()
    colors=a.locator('.bn-color-picker-dropdown:visible');expect(colors).to_be_visible()
    box=colors.bounding_box();assert box['width']>=260 and box['height']<=a.viewport_size['height']-20,box
    assert box['y']>=0 and box['y']+box['height']<=a.viewport_size['height'],box
    a.screenshot(path=str(artifacts/'recycle-colors-dark.png'),full_page=True)
    a.keyboard.press('Escape');a.keyboard.press('Escape')
    a.get_by_role('button',name='Tạo trang con',exact=True).click()
    a.get_by_label('Tên trang hoặc không gian').fill('Trang cần xóa')
    a.get_by_role('button',name='Tạo mới',exact=True).click()
    expect(a.get_by_label('Tiêu đề trang')).to_have_value('Trang cần xóa')
    child=re.search(r'page=([^&]+)',a.url).group(1)
    a.goto(base+'/workspace?page='+root,wait_until='networkidle')
    page_link=editor.locator('[data-content-type="pageLink"]');expect(page_link).to_be_visible()
    expect(page_link.locator('button')).to_have_count(0)
    expect(a.locator('#workspace-page-sidebar button[aria-label^="Tạo trang con trong"]')).to_have_count(0)
    page_link.hover();a.wait_for_timeout(400);a.get_by_role('button',name='Mở trình đơn khối',exact=True).click()
    a.get_by_role('menuitem',name='Chuyển vào thùng rác',exact=True).click()
    expect(page_link).to_have_count(0)
    expect(a.locator('#workspace-page-sidebar').get_by_text('Trang cần xóa',exact=True)).to_have_count(0)
    assert alice.request.get(base+'/api/workspace/pages/'+child).status==404
    a.goto(gallery,wait_until='networkidle')
    expect(a.get_by_text(re.compile('Trang chưa xếp lĩnh vực'))).to_have_count(0)
    expect(a.get_by_role('button',name='Mở vở ghi hiện có →',exact=True)).to_have_count(0)
    def open_trash():
        a.get_by_role('button',name='Mở thùng rác',exact=True).click()
        expect(a.get_by_role('dialog')).to_be_visible()
    open_trash()
    a.get_by_role('button',name='Khôi phục Trang cần xóa',exact=True).click()
    expect(a.get_by_text('Thùng rác trống.',exact=True)).to_be_visible()
    a.get_by_role('dialog').get_by_role('button',name='Close',exact=True).click()
    assert api(alice,'/pages/'+child)['title']=='Trang cần xóa'
    api(alice,'/pages/'+child+'/archive','POST',{})
    open_trash()
    a.get_by_role('button',name='Xóa vĩnh viễn Trang cần xóa',exact=True).click()
    expect(a.get_by_role('heading',name='Xóa vĩnh viễn “Trang cần xóa”?',exact=True)).to_be_visible()
    a.get_by_role('button',name='Hủy',exact=True).click()
    expect(a.get_by_role('button',name='Khôi phục Trang cần xóa',exact=True)).to_be_visible()
    a.get_by_role('button',name='Xóa vĩnh viễn Trang cần xóa',exact=True).click()
    a.get_by_role('button',name='Xóa vĩnh viễn',exact=True).click()
    expect(a.get_by_text('Thùng rác trống.',exact=True)).to_be_visible()
    assert alice.request.post(base+'/api/workspace/pages/'+child+'/restore',data={},headers={'Origin':base}).status==404
    a.get_by_role('dialog').get_by_role('button',name='Close',exact=True).click()
    def trash_field():
        a.get_by_role('button',name='Thao tác lĩnh vực Sổ tay dự án',exact=True).click()
        a.get_by_role('menuitem',name='Chuyển vào thùng rác',exact=True).click()
        a.get_by_role('dialog').get_by_role('button',name='Chuyển vào thùng rác',exact=True).click()
        expect(a.locator('article')).to_have_count(0)
    trash_field();open_trash()
    a.get_by_role('button',name='Khôi phục Sổ tay dự án',exact=True).click()
    expect(a.get_by_text('Thùng rác trống.',exact=True)).to_be_visible()
    a.get_by_role('dialog').get_by_role('button',name='Close',exact=True).click()
    expect(a.locator('article')).to_have_count(1)
    trash_field();open_trash()
    a.get_by_role('button',name='Xóa vĩnh viễn Sổ tay dự án',exact=True).click()
    a.screenshot(path=str(artifacts/'recycle-confirm-dark.png'),full_page=True)
    a.get_by_role('button',name='Xóa vĩnh viễn',exact=True).click()
    expect(a.get_by_text('Thùng rác trống.',exact=True)).to_be_visible()
    assert alice.request.get(base+'/api/workspace/pages/'+root).status==404
    a.get_by_role('dialog').get_by_role('button',name='Close',exact=True).click()
    legacy=api(alice,f"/spaces/{space['id']}/pages",'POST',{'title':'Ghi chú cũ'})
    a.get_by_role('button',name='Tìm trang trong Workspace',exact=True).click()
    a.get_by_label('Tìm trang để mở tab').fill('Ghi chú cũ')
    a.get_by_role('listbox',name='Kết quả trang').get_by_role('option',name=re.compile('Ghi chú cũ')).click()
    expect(a.get_by_label('Tiêu đề trang')).to_have_value('Ghi chú cũ')
    api(alice,'/pages/'+legacy['id']+'/archive','POST',{})
    mobile,m=actor(0,{'width':390,'height':844});m.goto(gallery,wait_until='networkidle',timeout=90000)
    m.get_by_role('button',name='Mở thùng rác',exact=True).click()
    expect(m.get_by_role('button',name='Khôi phục Ghi chú cũ',exact=True)).to_be_visible()
    assert m.evaluate('document.documentElement.scrollWidth<=innerWidth')
    m.screenshot(path=str(artifacts/'recycle-mobile.png'),full_page=True)
    m.get_by_role('button',name='Khôi phục Ghi chú cũ',exact=True).click()
    expect(m.get_by_text('Thùng rác trống.',exact=True)).to_be_visible()
    assert not errors,errors
    print('PASS: wide bounded color menu, trash icons, clean page links/sidebar/header/gallery, named history policy, page/field recycle restore and permanent deletion with cancellation, legacy page search and mobile.',flush=True)
    browser.close()
