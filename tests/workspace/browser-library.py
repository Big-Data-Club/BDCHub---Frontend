"""Owned local app with isolated workspace_test API, normal NextAuth and real SQL."""
import json,os,re,sys,time
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
sys.stdout.reconfigure(encoding='utf-8')
artifacts=Path(os.environ['WORKSPACE_TEST_ARTIFACTS']);actors=json.loads((artifacts/'browser-sessions.json').read_text());base='http://localhost:3100'
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE') or (r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe' if os.name=='nt' else None))
    contexts=[];errors=[];expect.set_options(timeout=30000)
    def actor(index):
        production=os.environ.get('WORKSPACE_TEST_PRODUCTION')=='1';name='__Secure-bdc.session-token.v2' if production else 'bdc.session-token.v2'
        context=browser.new_context(viewport={'width':1600,'height':1050},timezone_id='Asia/Bangkok',extra_http_headers={'Cookie':name+'='+actors[index]['cookie']} if production else {})
        context.add_cookies([{'name':name,'value':actors[index]['cookie'],'domain':'localhost','path':'/','httpOnly':True,'sameSite':'Lax','secure':production}]);contexts.append(context)
        context.route('**/api/ai/agents/notifications',lambda route:route.fulfill(json={'notifications':[],'unread_count':0}))
        context.route('**/lmsapiv1/me/roles',lambda route:route.fulfill(json={'roles':['STUDENT']}))
        context.route('**/apiv1/api/users/*',lambda route:route.fulfill(json={'id':int(actors[index]['id']),'name':actors[index]['name'],'role':'ROLE_MEMBER'}))
        page=context.new_page();page.on('pageerror',lambda error:errors.append(error.message));return context,page
    alice,a=actor(0);bob,b=actor(1);eve,e=actor(2)
    def api(context,path,method='GET',data=None):
        try: response=context.request.fetch(base+'/api/workspace'+path,method=method,data=data,headers={'Origin':base})
        except Exception: raise RuntimeError('Isolated Workspace test API unavailable: '+path) from None
        assert response.ok,(path,response.status,response.text());return response.json()
    bootstrap=api(alice,'/bootstrap');api(bob,'/bootstrap');api(eve,'/bootstrap')
    personal=next(space for space in bootstrap['spaces'] if space['kind']=='personal');prefix='LIB '+str(int(time.time()))+' '
    field=api(alice,'/spaces/'+personal['id']+'/fields','POST',{'title':prefix+'Nghiên cứu','icon':'book','color':'violet'})
    def page(title,parent=None,context=alice,space=personal['id'],field_id=field['id']): return api(context,'/spaces/'+space+'/pages','POST',{'title':prefix+title,**({'parent_id':parent} if parent else {'field_id':field_id})})
    root=page('Sổ nghiên cứu');child=page('Chương một',root['id']);grand=page('Mục nhỏ',child['id']);unused=page('Chưa từng mở')
    secret=page('Cha bí mật');shared=page('Trang chia sẻ trực tiếp',secret['id'])
    invitation=api(alice,'/invitations','POST',{'page_id':shared['id'],'email':actors[1]['email'],'role':'viewer'});api(bob,'/invitations/'+invitation['id']+'/respond','POST',{'action':'accept'})
    team=api(alice,'/spaces','POST',{'title':prefix+'Nhóm'})
    invitation=api(alice,'/invitations','POST',{'space_id':team['id'],'email':actors[1]['email'],'role':'editor'});api(bob,'/invitations/'+invitation['id']+'/respond','POST',{'action':'accept'})
    authored=page('Biên bản do Bob tạo',context=bob,space=team['id'],field_id=None)
    for i in range(57): page('Ghi chép '+str(i).zfill(2))
    api(alice,'/pages/'+root['id']);api(alice,'/pages/'+child['id'])
    a.goto(base+'/workspace/library?tab=all',wait_until='networkidle',timeout=120000)
    expect(a.get_by_role('heading',name='Thư viện',exact=True)).to_be_visible(timeout=90000)
    table=a.get_by_role('table',name='Danh sách trang trong thư viện',exact=True)
    expect(table).to_be_visible();a.evaluate("localStorage.setItem('bdc-theme','dark')");a.reload(wait_until='networkidle')
    a.get_by_role('button',name='Tìm kiếm thư viện',exact=True).click();search=a.get_by_role('textbox',name='Tìm trong thư viện',exact=True);search.fill(prefix)
    expect(table.locator(':scope > tbody[data-page-id]')).to_have_count(50)
    a.get_by_role('button',name='Xem thêm trang',exact=True).click()
    expect(table.locator(':scope > tbody[data-page-id]')).to_have_count(65)
    expect(a.get_by_role('button',name='Xem thêm trang',exact=True)).to_have_count(0)
    a.get_by_role('heading',name='Thư viện',exact=True).scroll_into_view_if_needed()
    a.screenshot(path=str(artifacts/'library-dark.png'),full_page=True)
    a.get_by_role('button',name='Mở rộng '+root['title'],exact=True).click()
    nested=a.get_by_role('table',name='Trang con của '+root['title'],exact=True);expect(nested).to_be_visible()
    nested.get_by_role('button',name='Mở rộng '+child['title'],exact=True).click()
    expect(a.get_by_role('table',name='Trang con của '+child['title'],exact=True)).to_be_visible()
    assert table.locator('[data-page-id="'+grand['id']+'"]').count()==1
    a.get_by_role('button',name='Thu gọn '+root['title'],exact=True).click()
    expect(a.get_by_role('table',name='Trang con của '+root['title'],exact=True)).to_have_count(0)
    assert table.locator('[data-page-id="'+grand['id']+'"]').count()==1
    # Column visibility, order, mandatory title, and preference persistence.
    a.get_by_role('button',name='Thiết lập thư viện',exact=True).click();a.get_by_role('button',name=re.compile('Hiển thị thuộc tính')).click()
    panel=a.get_by_role('dialog');expect(panel.get_by_role('button',name='Ẩn cột Tên trang',exact=True)).to_be_disabled()
    panel.get_by_role('button',name='Hiện tất cả',exact=True).click();expect(table.locator(':scope > thead th')).to_have_count(7)
    panel.get_by_role('button',name='Đưa Ngày tạo lên',exact=True).click()
    assert table.locator(':scope > thead th').all_text_contents()[4].strip()=='Ngày tạo'
    panel.get_by_role('button',name='Ẩn cột Nguồn',exact=True).click();expect(table.locator(':scope > thead').get_by_text('Nguồn',exact=True)).to_have_count(0)
    a.screenshot(path=str(artifacts/'library-columns-dark.png'),full_page=True)
    a.keyboard.press('Escape');a.reload(wait_until='networkidle');expect(table).to_be_visible()
    expect(table.locator(':scope > thead').get_by_text('Nguồn',exact=True)).to_have_count(0)
    a.get_by_role('button',name='Thiết lập thư viện',exact=True).click();a.get_by_role('button',name=re.compile('Hiển thị thuộc tính')).click();a.get_by_role('dialog').get_by_role('button',name='Hiện tất cả',exact=True).click();a.keyboard.press('Escape')
    a.get_by_role('button',name='Tìm kiếm thư viện',exact=True).click();search.fill(prefix)
    # Property picker and advanced AND/OR filters are real API filters.
    a.get_by_role('button',name='Bộ lọc thư viện',exact=True).click();panel=a.get_by_role('dialog')
    expect(panel.get_by_role('textbox',name='Tìm thuộc tính để lọc')).to_be_visible();panel.get_by_role('button',name='Tên trang',exact=True).click()
    panel.get_by_role('textbox',name='Giá trị bộ lọc 1',exact=True).fill(root['title'])
    expect(table.locator(':scope > tbody[data-page-id]')).to_have_count(1)
    a.screenshot(path=str(artifacts/'library-filters-dark.png'),full_page=True)
    panel.get_by_role('button',name='Thêm bộ lọc',exact=True).click();panel.get_by_label('Thuộc tính bộ lọc 2',exact=True).select_option('creator')
    panel.get_by_label('Giá trị bộ lọc 2',exact=True).select_option(actors[1]['id']);expect(a.get_by_role('heading',name='Chưa có trang phù hợp',exact=True)).to_be_visible()
    panel.get_by_label('Kết hợp bộ lọc',exact=True).select_option('any');expect(table.locator(':scope > tbody[data-page-id]')).to_have_count(2)
    panel.get_by_role('button',name='Đặt lại bộ lọc',exact=True).click();a.keyboard.press('Escape')
    # Favorites from the library must not invent a visit on an unopened page.
    search.fill(unused['title']);expect(table.locator(':scope > tbody[data-page-id]')).to_have_count(1)
    expect(table.get_by_text('Chưa mở',exact=True)).to_be_visible()
    table.get_by_role('button',name='Yêu thích '+unused['title'],exact=True).click();expect(table.get_by_role('button',name='Bỏ yêu thích '+unused['title'],exact=True)).to_have_attribute('aria-pressed','true')
    expect(table.get_by_text('Chưa mở',exact=True)).to_be_visible()
    search.fill('');a.get_by_role('tab',name='Yêu thích',exact=True).click();expect(table.get_by_role('link',name=unused['title'],exact=True)).to_be_visible()
    a.get_by_role('tab',name='Riêng tư',exact=True).click();expect(table).to_be_visible();expect(table.get_by_role('link',name=authored['title'],exact=True)).to_have_count(0)
    a.get_by_role('tab',name='Được chia sẻ',exact=True).click();expect(table.get_by_role('link',name=authored['title'],exact=True)).to_be_visible()
    # A directly shared child must not disclose its private parent or field.
    b.goto(base+'/workspace/library?tab=shared',wait_until='networkidle');bt=b.get_by_role('table',name='Danh sách trang trong thư viện',exact=True)
    expect(bt.get_by_role('link',name=shared['title'],exact=True)).to_be_visible();expect(bt.get_by_role('link',name=secret['title'],exact=True)).to_have_count(0)
    row=bt.locator('[data-page-id="'+shared['id']+'"]');expect(row.get_by_role('button',name='Được chia sẻ',exact=True)).to_be_visible();assert secret['id'] not in row.inner_html()
    # Both palettes and narrow screens retain bounded popovers and table scrolling.
    a.evaluate("localStorage.setItem('bdc-theme','light')");a.reload(wait_until='networkidle');expect(table).to_be_visible();a.screenshot(path=str(artifacts/'library-light.png'),full_page=True)
    a.set_viewport_size({'width':390,'height':844});a.get_by_role('button',name='Thiết lập thư viện',exact=True).click();a.get_by_role('button',name=re.compile('Hiển thị thuộc tính')).click()
    panel=a.get_by_role('dialog');box=panel.bounding_box();assert box['x']>=0 and box['x']+box['width']<=391,box
    assert a.evaluate('document.documentElement.scrollWidth<=innerWidth+1');a.screenshot(path=str(artifacts/'library-mobile.png'),full_page=True);a.keyboard.press('Escape')
    # New pages use a selected real field, then appear in the existing editor.
    a.set_viewport_size({'width':1600,'height':1050});a.get_by_role('button',name='Trang mới',exact=True).click()
    a.get_by_label('Tên trang mới',exact=True).fill(prefix+'Tạo từ thư viện');a.get_by_label('Không gian lưu trang',exact=True).select_option(personal['id']);a.get_by_label('Lĩnh vực lưu trang',exact=True).select_option(field['id'])
    a.get_by_role('button',name='Tạo trang',exact=True).click();expect(a.get_by_label('Tiêu đề trang')).to_have_value(prefix+'Tạo từ thư viện')
    a.get_by_role('link',name='Thư viện',exact=True).click();expect(a.get_by_role('heading',name='Thư viện',exact=True)).to_be_visible()
    assert not errors,errors
    print('PASS: library aggregation, pagination, nested pages, filters, visibility/order persistence, private sources, truthful visits, favorites, creation and light/dark/mobile')
    for context in contexts:context.close()
    browser.close()
