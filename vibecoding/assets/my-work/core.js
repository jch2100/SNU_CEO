(function (root) {
  'use strict';
  function recommend(input, cases) {
    const text = input.normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase();
    if (!text) return [];
    return cases.map(item => {
      const hits = item.patterns.filter(([, pattern]) => new RegExp(pattern, 'i').test(text));
      let score = hits.reduce((sum, [weight]) => sum + weight, 0);
      const matched = hits.map(([, pattern]) => text.match(new RegExp(pattern, 'i'))[0]);
      if(item.id==='invoice' && /옮[기겨]|기입|입력|타이핑|추출|복붙/.test(text) && /파일|문서|숫자|값|양식|pdf|엑셀/.test(text)) {
        score+=7;matched.push('항목을 옮겨 정리하기');
      }
      if(item.id==='ledger' && /모[아으을]|취합|합[치쳐산]|통합/.test(text) && /팀|부서|파일|표|내역|월|여러/.test(text)) {
        score+=7;matched.push('흩어진 자료를 모으기');
      }
      if(item.id==='faq' && /답변(?:은|을)?\s*(?:말고|아니|필요\s*없)|답변.*(?:안\s*만들|안\s*쓰)/.test(text))score=0;
      return { item, score, matched:[...new Set(matched)] };
    }).filter(entry => entry.score >= 4).sort((a,b) => b.score - a.score).slice(0,2);
  }
  const dataStates = {
    ready: '사용 권한이 있는 실제 샘플을 준비할 수 있습니다. 아직 이 대화에 첨부하지는 않았습니다. 민감정보를 가린 뒤 전달하겠습니다.',
    none: '현재 사용할 샘플이 없습니다. 필요한 샘플과 가릴 정보를 안내해주세요. 준비가 어렵다면 가상 샘플 사용 의사를 먼저 확인해주세요.',
    dummy: '먼저 가상 샘플로 시작하고 싶습니다. 가상 자료에서의 성공과 실제 업무 자료 검증은 구분해주세요.',
    unknown: '어떤 자료를 사용할 수 있을지 아직 확인하지 못했습니다. 필요한 자료와 사용 권한을 확인하는 것부터 도와주세요.'
  };
  function makePackage(item, options) {
    const { context, scope, checks, extra = '', mode = 'repeat', data = 'unknown', tool = '' } = options;
    const purpose = mode === 'once' ? '먼저 일회성 결과를 만들어 쓸 만한지 확인하고 싶습니다. 반복해서 사용할 도구가 필요한지는 그 뒤 판단하겠습니다.' : '이 업무를 반복해서 도와줄 작은 도구를 만들고 싶습니다. 먼저 소량의 자료로 핵심 작업 하나부터 확인하겠습니다.';
    const task = `${context.trim()}\n\n먼저 할 일: ${scope.trim()}\n결과물 후보: ${item.outcome}\n확인 방법: ${checks.trim()}`;
    const prompt = `제 업무 상황은 다음과 같습니다.\n${context.trim()}\n\n저는 코딩 초보자입니다. ${purpose}\n\n제가 선택한 방향은 '${item.title}'입니다.\n첫 범위: ${scope.trim()}\n받고 싶은 결과의 후보: ${item.outcome}\n확인 기준: ${checks.trim()}\n\n자료 상태: ${dataStates[data] || dataStates.unknown}\n준비 자료의 후보: ${item.materials}\n${extra.trim() ? `제가 덧붙인 조건: ${extra.trim()}\n` : ''}${tool ? `작업할 도구: ${tool}. 필요한 기능과 접근 가능 여부는 실제 환경에서 먼저 확인해주세요.\n` : '사용할 도구와 환경은 아직 정하지 않았습니다. 시작에 필요한 조건이 있으면 짧게 확인해주세요.\n'}\n첫 답변에서는 이해한 업무, 가장 작게 시작할 계획, AI가 할 일과 제가 지금 할 일을 구분하여 짧게 알려주세요. 제가 할 일은 초보자도 따라 할 수 있게 안내해주세요. 이미 적은 내용을 다시 묻지 말고, 계획을 바꾸는 정보가 빠졌을 때만 한 번에 하나씩 질문해주세요.\n바로 구현하지 말고 자료 구조와 첫 범위를 저와 확인한 다음 진행해주세요. 방법은 만들고 다시 쓰기 쉬운 쪽으로 제안해주세요.\n\n원본은 보존하고 결과는 별도로 만들어주세요. 모르는 값이나 근거 없는 내용은 추측하지 말고 '확인 필요'로 남겨주세요. 원본과 결과를 대조할 방법도 마련해주세요.\n이번 첫 버전에서 제외할 후보는 ${item.exclude}입니다. 제 조건과 다르면 먼저 범위를 확인해주세요. 외부 발송·게시·계정 변경은 제 승인 없이 하지 마세요.\n\n참고 방향: ${item.title} — 원 사례의 작업 구조를 수업용으로 각색한 제안이며, 제 환경에서 검증된 성공 사례는 아닙니다.`;
    const destination = tool ? `${tool}에서 새 작업 또는 대화를 열고 시작 프롬프트를 붙여 넣으세요.` : '수업에서 사용하는 바이브코딩 도구의 새 작업 또는 대화를 여세요. 도구가 아직 없으면 강사·TA와 먼저 확인하세요.';
    const preparation = data === 'dummy' ? '가상 자료로 시작하겠다고 전달하세요. 실제 회사 자료로도 되는지는 이후 따로 확인합니다.' : data === 'ready' ? '사용 가능한 샘플의 민감정보를 가리세요. 원본을 보존하고, 가린 결과를 확인한 뒤 필요한 자료만 전달하세요.' : '자료가 없거나 미정인 상태 그대로 시작하세요. 안내받은 샘플과 사용 권한을 확인한 뒤 준비하면 됩니다.';
    const actions = [destination, preparation, '첫 답변이 내 업무·작은 첫 범위·자료 상태를 제대로 반영했는지 확인하세요. 맞으면 그 계획으로 진행을 요청하세요.', `첫 결과를 확인할 기준: ${checks.trim().replace(/[.!。]$/, '')}.`];
    const help = `제가 선택한 과제는 '${item.title}'입니다.\n지금 하려는 일: ${scope.trim()}\n자료 상태: ${dataStates[data] || dataStates.unknown}\n막힌 곳: [여기에 작성]\n이미 해본 것: [여기에 작성]\n다음 행동을 함께 봐주세요.`;
    return { task, prompt, actions, help, title: item.title };
  }
  const exploration = {
    title: '첫 과제를 함께 찾기',
    prompt: '저는 업무를 개선하고 싶지만 아직 첫 과제를 정하지 못했습니다. 제 직무·자료·사용 환경은 아직 설명하지 않았습니다. 최근 반복해서 한 일을 편하게 말할 수 있도록 한 번에 하나씩 짧게 질문해주세요. 답을 바탕으로 누구의 어떤 불편을 줄일지, 준비 가능한 자료는 무엇인지, 첫 결과를 무엇으로 확인할지 함께 좁혀주세요. 모르는 정보는 추측하지 말고 과제가 정해지기 전에 구현을 시작하지 마세요.',
    help: '아직 첫 과제를 못 골랐습니다. 최근 반복한 일을 함께 정리하고, 가장 필요한 작업 하나부터 찾고 싶습니다.'
  };
  function explorationPrompt(context='') {
    if(!context.trim())return exploration.prompt;
    return `제가 설명한 업무 상황입니다.\n${context.trim()}\n\n이 설명을 바탕으로 첫 과제를 구체화하고 싶습니다. 관련 사례를 찾지 못했지만 업무가 부적절하다고 단정하지 마세요. 이미 적은 내용은 다시 묻지 말고, 어떤 결과를 원하고 어떤 자료를 준비할 수 있는지 필요한 질문을 한 번에 하나씩 해주세요. 누구의 불편을 어디까지 줄일지, 첫 결과를 무엇으로 확인할지 함께 정해주세요. 모르는 정보는 추측하지 말고, 제가 첫 범위를 확인하기 전에는 구현하지 마세요.`;
  }
  function inferDataState(context='') {
    const compact=context.replace(/\s+/g,'');
    if(/가상(?:자료|샘플)|샘플로먼저/.test(compact))return 'dummy';
    if(/(?:자료|파일|샘플)(?:은|는|이|가|도)?(?:아직|지금)?없/.test(compact))return 'none';
    return 'unknown';
  }
  const api = { recommend, makePackage, exploration, explorationPrompt, inferDataState, dataStates };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LearnerCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
