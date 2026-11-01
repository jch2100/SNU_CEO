/* Local UI. No network requests or automatic storage. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const cases = window.CASES, core = window.LearnerCore;
  const state = { context: '', selected: null, package: null, timer: null, drafts: {}, preferences: null, previousInput: null };
  const stageIds = ['entry','results','fit','output','exploration'];
  function showStage(id) {
    clearTimeout(state.timer); $('status').textContent = '';
    stageIds.forEach(name => { $(name).hidden = name !== id; });
    document.querySelectorAll('[data-step]').forEach(node => {
      node.removeAttribute('aria-current');
      if (node.dataset.step === id || (id === 'exploration' && node.dataset.step === 'entry')) node.setAttribute('aria-current','step');
    });
    const heading = $(id).querySelector('h2');
    heading.focus({preventScroll:true});
    document.body.classList.toggle('tool-in-progress',id!=='entry');
    $(id).scrollIntoView({behavior:'instant',block:'start'});
  }
  function node(tag, text, className) {
    const el = document.createElement(tag);
    if (text !== undefined) el.textContent = text;
    if (className) el.className = className;
    return el;
  }
  function notify(message) {
    clearTimeout(state.timer); $('status').textContent = message;
    state.timer = setTimeout(() => { $('status').textContent = ''; },6500);
  }
  function browseExample(item) {
    if($('work-input').value.trim() && $('example-note').hidden)state.previousInput=$('work-input').value;
    $('work-input').value = item.example;
    $('example-note').hidden = false; $('work-error').textContent = '';
    $('restore-input').hidden=!state.previousInput;
    showStage('entry'); $('work-input').focus();
  }
  cases.forEach((item,index) => {
    const button = node('button',undefined,'example'); button.type = 'button';
    button.append(node('small',`${String(index+1).padStart(2,'0')} / ${item.category}`),node('strong',item.title),node('span','↗','arrow'));
    button.addEventListener('click',() => browseExample(item));
    $('example-grid').append(button);
  });
  function preview(item) {
    const wrap = node('div',undefined,'table-scroll');
    const table = node('table'); table.setAttribute('aria-label',`${item.title}의 가상 결과 예시`);
    const head = node('thead'), row = node('tr');
    item.preview.headers.forEach(text => { const th=node('th',text); th.scope='col'; row.append(th); }); head.append(row);
    const body = node('tbody'); item.preview.rows.forEach(values => {const tr=node('tr');values.forEach(value=>tr.append(node('td',value)));body.append(tr);});
    table.append(head,body);wrap.append(table);return wrap;
  }
  function card(entry,index) {
    const item = entry.item, article = node('article',undefined,'case-card'); article.dataset.case = item.id;
    article.append(node('p',`${String(index+1).padStart(2,'0')} / ${item.category}`,'category'),node('h3',item.title),node('p',item.summary,'summary'),node('p',`입력과 연결한 표현: ${entry.matched.join(' · ')}`,'match'));
    const dl=node('dl');
    [['내 업무와 연결하면',item.reason],['받아볼 결과',item.outcome]].forEach(([title,text])=>dl.append(node('dt',title),node('dd',text)));
    article.append(dl);
    if (item.condition) article.append(node('p',item.condition,'notice'));
    const choose=node('button','이 방향으로 내 과제 정하기','primary');choose.type='button';choose.addEventListener('click',()=>selectCase(item));article.append(choose);
    article.append(node('p','이해를 돕기 위한 가상 결과 예시','preview-label'),preview(item));
    const details=node('details');details.append(node('summary','준비 자료·첫 범위·참고 사례 보기'));
    for(const [label,value] of [['필요한 자료',item.materials],['작게 시작하기',item.scope],['확인할 것',item.checks]]){const p=node('p');p.append(node('strong',label+': '),document.createTextNode(value));details.append(p);}
    details.append(node('p',item.caution),node('p',`${item.evidence} · 우리 환경 재현 미검증`),node('p',item.limit),node('p','아래 작업 구조를 참고해 한국어로 새로 썼습니다. 원문의 프롬프트를 번역한 것이 아닙니다.'));
    [['참고 사이트의 사례','https://agentusecases.ai/use-case/'+item.source],['원출처',item.original]].forEach(([title,url])=>{const p=node('p'),a=node('a',title+' ↗');a.href=url;a.target='_blank';a.rel='noopener noreferrer';p.append(a);details.append(p);});
    article.append(details);
    return article;
  }
  function runRecommendation(preserve=false) {
    const input=$('work-input').value.trim();
    if (!input) {$('work-error').textContent='번거로운 일을 한두 문장으로 적거나 아래 예시를 골라주세요.';$('work-input').focus();return;}
    if(!preserve && input!==state.context){state.drafts={};state.preferences={data:core.inferDataState(input),mode:'repeat',tool:'',extra:''};}
    state.context=input; state.selected=null;state.package=null;
    $('start-prompt').value='';$('case-grid').replaceChildren();$('refine-form').hidden=true;
    $('context-quote').textContent=input;
    const entries=core.recommend(input,cases);
    if (!entries.length) {
      $('exploration-title').textContent='내 업무 설명을 이어서 구체화해보세요.';
      $('explore-prompt').value=core.explorationPrompt(state.context);
      $('exploration-message').textContent='지금 설명만으로는 조사한 사례에서 충분히 가까운 방향을 찾지 못했습니다. 최근 반복한 작업이나 받고 싶은 결과를 하나만 더 알려주세요. 예시를 보거나 과제 탐색용 요청문으로 시작할 수도 있습니다.';
      showStage('exploration');return;
    }
    $('case-grid').classList.toggle('single-case',entries.length===1);
    $('results-description').textContent=entries.length===1?'현재 설명과 가까운 방향 한 가지입니다. 결과가 내 뜻과 맞는지 살펴보세요.':'두 방향의 결과와 준비 자료를 비교해보세요. 지금 필요한 쪽 하나를 고르면 됩니다.';
    entries.forEach((entry,index)=>$('case-grid').append(card(entry,index)));
    showStage('results');
  }
  function selectCase(item) {
    state.selected=item;state.package=null;
    $('chosen-name').textContent=item.title;
    const draft=state.drafts[item.id];
    const prefs=state.preferences||{data:core.inferDataState(state.context),mode:'repeat',tool:'',extra:''};
    $('scope').value=draft?.scope||item.scope;$('checks').value=draft?.checks||item.checks;
    $('data-state').value=prefs.data;$('extra').value=prefs.extra;$('mode').value=prefs.mode;$('tool').value=prefs.tool;
    showStage('fit');
  }
  function saveFit(){
    if(!state.selected)return;
    state.drafts[state.selected.id]={scope:$('scope').value,checks:$('checks').value};
    state.preferences={data:$('data-state').value,mode:$('mode').value,tool:$('tool').value,extra:$('extra').value};
  }
  $('fit-form').addEventListener('input',saveFit);$('fit-form').addEventListener('change',saveFit);
  $('work-form').addEventListener('submit',event=>{event.preventDefault();runRecommendation();});
  $('work-input').addEventListener('input',()=>{$('example-note').hidden=true;$('work-error').textContent='';});
  $('restore-input').addEventListener('click',()=>{if(state.previousInput){$('work-input').value=state.previousInput;state.previousInput=null;$('example-note').hidden=true;$('work-input').focus();}});
  $('not-fit').addEventListener('click',()=>{$('refine-form').hidden=false;$('refine-input').focus();});
  $('refine-form').addEventListener('submit',event=>{event.preventDefault();const addition=$('refine-input').value.trim();if(!addition)return;const next=state.context+'\n덧붙이면: '+addition;if(next.length>2400){notify('설명이 길어졌습니다. 업무 설명 수정하기에서 핵심을 줄여주세요.');return;}$('work-input').value=next;$('refine-input').value='';runRecommendation(true);});
  $('fit-form').addEventListener('submit',event=>{
    event.preventDefault();if(!state.selected)return;
    const scope=$('scope').value.trim(),checks=$('checks').value.trim();
    if(!scope||!checks){notify('첫 범위와 확인 방법을 짧게 적어주세요.');return;}
    state.package=core.makePackage(state.selected,{context:state.context,scope,checks,extra:$('extra').value,mode:$('mode').value,data:$('data-state').value,tool:$('tool').value});
    $('task-title').textContent=state.package.title;$('task-text').textContent=state.package.task;
    $('start-prompt').value=state.package.prompt;$('help-text').value=state.package.help;
    $('start-prompt').setSelectionRange(0,0);$('start-prompt').scrollTop=0;
    $('first-actions').replaceChildren(...state.package.actions.map(text=>node('li',text)));
    showStage('output');
  });
  $('explore-prompt').value=core.exploration.prompt;
  $('unsure').addEventListener('click',()=>{$('exploration-title').textContent='아직 과제가 없어도 괜찮습니다.';$('explore-prompt').value=core.explorationPrompt($('work-input').value);$('exploration-message').textContent='최근 반복해서 하면서 번거로웠던 일 하나를 떠올려보세요. 예시부터 봐도 되고, 아래 요청문으로 AI와 함께 찾아도 됩니다.';showStage('exploration');});
  $('explore-back').addEventListener('click',()=>{showStage('entry');$('work-input').focus();});
  document.querySelectorAll('[data-back]').forEach(button=>button.addEventListener('click',()=>showStage(button.dataset.back)));
  $('home-link')?.addEventListener('click',event=>{event.preventDefault();showStage('entry');});
  document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{
    const field=$(button.dataset.copy);
    try {
      if(!navigator.clipboard||!window.isSecureContext)throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(field.value);notify('복사했습니다. 새 대화에 붙여 넣어 시작하세요.');
    } catch {
      field.focus();field.select();notify('자동 복사가 어려워 내용을 선택했습니다. Ctrl+C 또는 기기의 복사 메뉴를 사용하세요.');
    }
  }));
  $('download').addEventListener('click',()=>{
    if(!state.package)return;
    const pack=state.package;
    const text=`내 업무의 첫 시도\n\n[내 과제]\n${pack.task}\n\n[내 시작 프롬프트]\n${pack.prompt}\n\n[내 첫 행동]\n${pack.actions.map((a,i)=>`${i+1}. ${a}`).join('\n')}\n\n[도움 요청]\n${pack.help}\n\n원 사례를 참고한 자체 각색입니다. 실제 업무 재현은 미검증입니다.\n참고 사례: https://agentusecases.ai/use-case/${state.selected.source}\n원출처: ${state.selected.original}\n`;
    const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));
    const a=node('a');a.href=url;a.download='내업무_첫시도_시작안내.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('과제·프롬프트·안내를 텍스트 파일로 내려받았습니다.');
  });
})();
