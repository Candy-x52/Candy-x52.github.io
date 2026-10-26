"use strict";
const stages = {
 input:{kind:"01 / INPUT",title:"写作要求",description:"将主题、人物、目的、风格和字数要求输入主流程，作为内容规划的约束。",data:{zhuti:"普通人学习 AI 的成长故事",renwu:"小林，行政人员",mudi:"展示从不会到动手尝试的过程",writing_style:"朴实、具体",zishu:"1500"},boundary:"这些是演示填写的要求。网页不提交数据，也不会调用模型生成文章。"},
 outline:{kind:"02 / PLANNER",title:"大纲规划 Agent",description:"主流程中的规划节点要求拆出 3–6 个子主题，给出标题、摘要、目的关联、风格提示和建议字数。",data:{subtopics:[{title:"一次具体的困惑",summary:"反复整理材料，开始寻找更方便的办法",estimated_length:500},{title:"第一次动手尝试",summary:"从小任务理解 AI 工具",estimated_length:500},{title:"回看与继续改进",summary:"记录尝试的边界与下一步",estimated_length:500}]},boundary:"此处大纲是为解释数据结构编写的示例，不是工作流的实际输出。规划节点配置了风格工具，不等于每轮都会调用。"},
 parse:{kind:"03 / STRUCTURE",title:"解析章节列表",description:"代码节点使用 json.loads() 读取规划结果，再取出 subtopics，供章节迭代逐项使用。",data:{before:"包含 subtopics 的 JSON 文本",after:"章节对象的列表",current_item:{title:"第一次动手尝试",estimated_length:500}},boundary:"模型文本若包含额外说明或 JSON 不完整，解析可能失败。列表迭代与章节内部循环是两种不同的控制结构。"},
 background:{kind:"04 / BACKGROUND",title:"整理下一章的背景",description:"主流程先整理历史内容和当前章节信息，再显式传给 HTTP 扩写请求。",data:{zhuti:"当前章节的 summary",zishu:"当前章节的 estimated_length",beijing:"整理后的前文背景"},boundary:"两个应用中即使存在同名 history，也不会自动共享记忆；跨应用数据需要在请求中显式传递。"},
 loop:{kind:"04 / WRITER SUBFLOW",title:"循环扩写子流程",description:"扩写应用围绕本章主题与背景生成文本，统计 history 的字符数，再判断继续扩写还是退出。",data:{inputs:["zhuti","zishu","beijing"],stop_condition:"len(history) ≥ 目标值，或达到 30 次上限",history_update:"本轮模型输出覆盖子流程 history"},boundary:"统计的是字符而非 token，标点也计入。子流程不是代码自动拼接新旧正文，前文能否保留取决于本轮模型输出。"},
 format:{kind:"04 / FORMAT & MERGE",title:"格式整理与章节汇总",description:"主流程解析 HTTP 返回的 answer，将章节标题与正文整理后，再与已有正文拼接并写回自己的 history。",data:{extract:"HTTP 返回体 → answer",format:"章节标题 + 正文格式整理",merge:"主流程 history + 当前章 text"},boundary:"主流程按章拼接，子流程覆盖历史，两者的更新方式不同。只有实际执行记录才能确认接口返回与章节连贯性。"},
 style:{kind:"TOOL / STYLE CHECKER",title:"风格检查与修订",description:"独立 Workflow 接收目标风格与待检查文本，经 LLM 返回风格分析、建议和修订文本。",data:{inputs:["writing_style","text"],requested_fields:["analysis","suggestion","revised_text"],return_type:"LLM 文本"},boundary:"返回的文本长得像 JSON，不等于已解析成对象。风格检查不代表事实核验；工具是否实际调用需查看 Agent 执行记录。"},
 output:{kind:"05 / OUTPUT",title:"最终正文",description:"主流程在各章迭代结束后，返回汇总 history 作为文章正文。",data:{output:"主流程 history",expected_shape:"章节一标题与正文 + 章节二标题与正文 + …",next_check:["是否遗漏约束","章节是否衔接","风格是否统一"]},boundary:"本页没有生成正文，也没有验证整条工作流跑通。教程提到的引用管理、事实校验或发布集成，不作为此项目已经实现的能力。"}
};
const order=["input","outline","parse","background","loop","format","output"];
let current="input";
function selectStage(key){
 const stage=stages[key]; if(!stage)return;current=key;
 document.querySelectorAll('[data-stage]').forEach(b=>{const selected=b.dataset.stage===key;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));});
 document.getElementById('stage-kind').textContent=stage.kind;
 document.getElementById('stage-title').textContent=stage.title;
 document.getElementById('stage-description').textContent=stage.description;
 document.getElementById('stage-input').textContent=JSON.stringify(stage.data,null,2);
 document.getElementById('stage-boundary').textContent=stage.boundary;
 const index=order.indexOf(key);
 document.getElementById('previous-stage').disabled=index<=0;
 document.getElementById('next-stage').disabled=index<0||index===order.length-1;
 document.getElementById('stage-status').textContent='当前查看：'+stage.title;
}
document.querySelectorAll('[data-stage]').forEach(b=>b.addEventListener('click',()=>selectStage(b.dataset.stage)));
document.getElementById('previous-stage').addEventListener('click',()=>{const i=order.indexOf(current);if(i>0)selectStage(order[i-1]);});
document.getElementById('next-stage').addEventListener('click',()=>{const i=order.indexOf(current);if(i>=0&&i<order.length-1)selectStage(order[i+1]);});
selectStage('input');
