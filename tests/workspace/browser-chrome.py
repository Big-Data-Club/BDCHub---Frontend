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
    space=api(alice,'/spaces','POST',{'title':'Trải nghiệm Workspace '+str(int(time.time()))})
    gallery=base+'/workspace?space='+space['id']
    a.goto(gallery,wait_until='networkidle',timeout=120000)
    expect(a.get_by_role('heading',name='Một lĩnh vực của riêng bạn.')).to_be_visible(timeout=90000)
    a.evaluate("localStorage.setItem('bdc-theme','light')");a.reload(wait_until='networkidle')
    expect(a.get_by_role('heading',name='Một lĩnh vực của riêng bạn.')).to_be_visible()
    def field(title):
        a.get_by_role('button',name='Tạo lĩnh vực',exact=True).click()
        a.get_by_label('Tên lĩnh vực',exact=True).fill(title)
        a.get_by_role('dialog').get_by_role('button',name='Tạo lĩnh vực',exact=True).click()
        expect(a.get_by_role('dialog')).to_have_count(0)
        expect(a).to_have_url(gallery)
        expect(a.get_by_role('button',name='Mở lĩnh vực '+title,exact=True)).to_be_visible()
    field('Hệ thống phân tán');field('Khoa học dữ liệu')
    a.emulate_media(reduced_motion='no-preference')
    card=a.locator('article').first;card.hover();a.wait_for_timeout(350)
    assert card.evaluate('el=>getComputedStyle(el).transform')!='none'
    a.screenshot(path=str(artifacts/'chrome-gallery.png'),full_page=True)
    a.get_by_role('button',name='Mở lĩnh vực Hệ thống phân tán',exact=True).click()
    expect(a.locator('.bn-editor[contenteditable=true]')).to_be_visible(timeout=90000)
    catalog=[item for item in api(alice,'/bootstrap')['fields'] if item['space_id']==space['id']]
    field_one=next(item for item in catalog if item['title']=='Hệ thống phân tán')
    field_two=next(item for item in catalog if item['title']=='Khoa học dữ liệu')
    first=api(alice,'/pages/'+api(alice,'/tab-pages?field='+field_one['id'])[0]['id'])
    page_id=first['id']
    for name in ['Ảnh / tệp','Liên kết web','LaTeX']:
        expect(a.get_by_role('button',name=name,exact=True)).to_have_count(0)
    expect(a.get_by_text('Đã lưu',exact=True)).to_have_count(0)
    a.locator('.bn-editor').click();a.keyboard.insert_text('Kiểm tra tooltip định dạng chữ')
    a.keyboard.press('Control+a')
    expect(a.locator('.bn-formatting-toolbar')).to_be_visible(timeout=15000)
    a.get_by_role('button',name=re.compile('In đậm')).first.hover()
    tooltip=a.locator('[data-slot="tooltip-content"]:visible').last
    expect(tooltip).to_be_visible(timeout=10000)
    expect(tooltip).to_have_css('opacity','1')
    expect(a.locator('.bn-formatting-toolbar')).to_have_css('opacity','1')
    colors=tooltip.evaluate('el=>({bg:getComputedStyle(el).backgroundColor,fg:getComputedStyle(el).color,width:el.getBoundingClientRect().width})')
    print('Tooltip:',colors,flush=True)
    a.screenshot(path=str(artifacts/'chrome-tooltip.png'),full_page=True)
    assert colors['bg'] in ['rgb(255, 255, 255)','rgb(19, 34, 64)']
    assert colors['bg']!=colors['fg'] and colors['width']>60
    a.get_by_label('Tiêu đề trang').click()
    edge=a.get_by_role('separator',name='Thay đổi chiều rộng cây trang',exact=True)
    side=a.locator('#workspace-page-sidebar');before=side.bounding_box()['width'];box=edge.bounding_box()
    a.mouse.move(box['x']+4,250);a.mouse.down();a.mouse.move(box['x']+84,250,steps=12);a.mouse.up()
    assert side.bounding_box()['width']>before+60
    width=side.bounding_box()['width']
    a.keyboard.press('Control+Backslash');expect(side).not_to_be_visible()
    a.get_by_role('button',name='Mở cây trang',exact=True).click();expect(side).to_be_visible()
    assert abs(side.bounding_box()['width']-width)<2
    a.reload(wait_until='networkidle');expect(a.locator('.bn-editor')).to_be_visible(timeout=60000)
    assert abs(side.bounding_box()['width']-width)<2
    a.screenshot(path=str(artifacts/'chrome-editor.png'),full_page=True)
    a.get_by_role('button',name='Mở trang trong tab mới',exact=True).click()
    a.get_by_label('Lọc lĩnh vực trong bộ chọn tab').select_option(field_two['id'])
    a.get_by_label('Tìm trang để mở tab').fill('Khoa học dữ liệu')
    expect(a.get_by_role('listbox',name='Kết quả trang').get_by_role('option',name=re.compile('Khoa học dữ liệu'))).to_be_visible()
    expect(a.get_by_role('heading',name='Khoa học dữ liệu',exact=True)).to_be_visible()
    a.screenshot(path=str(artifacts/'chrome-tab-picker.png'),full_page=True)
    a.get_by_role('button',name='Mở tab workspace',exact=True).click()
    expect(a.get_by_label('Tiêu đề trang')).to_have_value('Khoa học dữ liệu')
    expect(a.get_by_role('tablist',name='Các tab trong workspace').get_by_role('tab')).to_have_count(2)
    a.get_by_role('button',name='Đóng tab Khoa học dữ liệu',exact=True).click()
    expect(a.get_by_label('Tiêu đề trang')).to_have_value('Hệ thống phân tán')
    a.get_by_role('button',name='Thông tin chỉnh sửa trang',exact=True).hover()
    expect(a.get_by_text('Được tạo bởi',exact=False)).to_be_visible()
    a.get_by_role('button',name='Thông tin chỉnh sửa trang',exact=True).click()
    a.get_by_role('tab',name='Thống kê',exact=True).click()
    expect(a.get_by_role('heading',name='Lượt xem (1)',exact=True)).to_be_visible()
    expect(a.get_by_label('Hiển thị tên tôi trong lịch sử xem trang này',exact=True)).to_have_count(0)
    assert api(alice,f'/pages/{page_id}/analytics')['viewers'][0]['name']=='Alice'
    a.get_by_text('Xem dữ liệu từng ngày',exact=True).click()
    expect(a.locator('aside[aria-label="Thông tin trang"] tbody tr')).to_have_count(28)
    a.get_by_label('Khoảng thời gian thống kê').select_option('7')
    expect(a.get_by_label('Khoảng thời gian thống kê')).to_have_value('7')
    a.screenshot(path=str(artifacts/'chrome-activity.png'),full_page=True)
    a.goto(base+'/workspace/guide',wait_until='networkidle')
    guide=a.locator('#workspace-editor-guide')
    a.evaluate("window.__guidePositions=[];document.getElementById('workspace-editor-guide').addEventListener('scroll',event=>window.__guidePositions.push(event.target.scrollTop))")
    a.get_by_role('link',name='Thư viện công thức',exact=True).click()
    for _ in range(60):
        if a.get_by_role('link',name='Thư viện công thức',exact=True).get_attribute('aria-current')=='location' and abs(a.locator('#workspace-guide-library').bounding_box()['y']-guide.bounding_box()['y']-90)<5:break
        a.wait_for_timeout(100)
    positions=a.evaluate('window.__guidePositions')
    assert len(positions)>2 and positions[-1]>positions[0],positions
    assert abs(a.locator('#workspace-guide-library').bounding_box()['y']-guide.bounding_box()['y']-90)<5
    a.screenshot(path=str(artifacts/'chrome-guide-scroll.png'),full_page=True)
    mobile,m=actor(0,{'width':390,'height':844})
    m.goto(base+'/workspace?page='+page_id,wait_until='networkidle',timeout=90000)
    expect(m.locator('.bn-editor')).to_be_visible(timeout=60000)
    m.get_by_role('button',name='Mở cây trang',exact=True).click();expect(m.locator('#workspace-page-sidebar')).to_be_visible()
    m.get_by_role('button',name='Đóng cây trang',exact=True).click(position={'x':380,'y':250});expect(m.locator('#workspace-page-sidebar')).not_to_be_visible()
    assert m.evaluate('document.documentElement.scrollWidth<=innerWidth')
    m.screenshot(path=str(artifacts/'chrome-mobile.png'),full_page=True)
    assert not errors,errors
    print('PASS: stay in field gallery after creation, tooltip colors, clean editor, relative activity and named view history, resizable/collapsible sidebar, workspace tabs and smooth guide navigation.',flush=True)
    browser.close()
