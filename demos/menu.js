"use strict";
const recipes=window.portfolioRecipes;
const selected=new Set();let filter="all",query="";
const byId=id=>recipes.find(r=>r.id===id);
function element(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
function setView(name){
 for(const view of ['menu','detail','inventory'])document.getElementById(view+'-view').hidden=view!==name;
 document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===name);b.setAttribute('aria-pressed',String(b.dataset.view===name));});
 document.querySelector('.phone-scroll').scrollTop=0;
}
function renderMenu(){
 const list=document.getElementById('recipe-list');list.replaceChildren();
 const visible=recipes.filter(r=>(filter==='all'||r.type===filter)&&(!query||(r.name+r.flavor+r.tags.join('')).includes(query)));
 document.getElementById('search-empty').hidden=visible.length>0;
 for(const recipe of visible){
  const card=element('article','food-card');const image=document.createElement('img');image.src=recipe.image;image.alt=recipe.name+'配图';image.width=240;image.height=180;image.loading='lazy';card.append(image);
  const body=element('div','food-card-copy');body.append(element('h4','',recipe.name),element('p','food-meta',recipe.cookTime+' 分钟 · '+recipe.difficulty));
  const detail=element('button','food-detail-link','查看做法 →');detail.setAttribute('aria-label','查看'+recipe.name+'做法');detail.addEventListener('click',()=>{renderDetail(recipe.id);setView('detail');document.getElementById('detail-recipe').focus();});
  const choose=element('button','choose-food'+(selected.has(recipe.id)?' selected':''),selected.has(recipe.id)?'✓ 已选':'＋ 加入菜单');choose.setAttribute('aria-label',(selected.has(recipe.id)?'移出菜单：':'加入菜单：')+recipe.name);choose.setAttribute('aria-pressed',String(selected.has(recipe.id)));choose.addEventListener('click',()=>{if(selected.has(recipe.id))selected.delete(recipe.id);else selected.add(recipe.id);updateSelection();renderMenu();list.querySelector('[data-recipe="'+recipe.id+'"]').focus();});choose.dataset.recipe=recipe.id;
  body.append(detail,choose);card.append(body);list.append(card);
 }
}
function updateSelection(){
 const items=recipes.filter(r=>selected.has(r.id));const meat=items.filter(r=>r.type==='meat').length;
 document.getElementById('menu-count').textContent=items.length?'已选 '+items.length+' 道 · 荤 '+meat+' · 素 '+(items.length-meat):'还没有选菜，从下方挑几道吧。';
 const list=document.getElementById('selected-list');list.replaceChildren();
 for(const item of items)list.append(element('span','selected-food-chip',item.name));
 document.getElementById('clear-menu').disabled=items.length===0;
}
function renderDetail(id){
 const r=byId(id)||recipes[0];document.getElementById('detail-recipe').value=r.id;const root=document.getElementById('recipe-detail');root.replaceChildren();
 const image=document.createElement('img');image.className='detail-food-photo';image.src=r.image;image.alt=r.name+'配图';image.width=480;image.height=320;
 root.append(image,element('h2','detail-food-name',r.name),element('p','detail-food-meta',r.cookTime+' 分钟 / '+r.servings+' 人份 / '+r.difficulty+' / '+r.flavor),element('h3','detail-section-title','01 准备食材'));
 const ingredients=element('dl','food-ingredients');for(const item of r.ingredients){const row=element('div','');row.append(element('dt','',item.name),element('dd','',item.amount));ingredients.append(row);}root.append(ingredients,element('h3','detail-section-title','02 开始烹饪'));
 const steps=element('ol','food-steps');for(const step of r.steps)steps.append(element('li','',step));root.append(steps,element('div','food-tip','厨房小贴士：'+r.tip));
}
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});renderMenu();}));
document.getElementById('recipe-search').addEventListener('input',e=>{query=e.target.value.trim();renderMenu();});
document.getElementById('clear-menu').addEventListener('click',()=>{selected.clear();updateSelection();renderMenu();});
const selector=document.getElementById('detail-recipe');for(const r of recipes){const option=element('option','',r.name);option.value=r.id;selector.append(option);}selector.addEventListener('change',()=>renderDetail(selector.value));
const stock=document.getElementById('stock-range');function updateStock(){const value=Number(stock.value);document.getElementById('bottle-level').style.height=value+'%';document.getElementById('stock-value').textContent=value+'%';document.getElementById('stock-status').textContent=value===0?'已经用完':value<25?'余量较少':value<75?'余量适中':'余量充足';}stock.addEventListener('input',updateStock);
renderMenu();updateSelection();renderDetail('m2');updateStock();
