import { tenantUrl } from "../api/domain";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useLanguage } from "../locales/LanguageContext";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, CirclePlus, ExternalLink, FolderTree, LayoutDashboard, LogOut, Menu, Package, Search, ShoppingBag, Store, Trash2, X, Layers3 } from "lucide-react";
import api, { tenantSlug, TOKEN_KEY, USER_KEY } from "../api/axios";
import type { Language } from "../types";
type Nav = { id:number;
name:string;
name_bn?:string;
route?:string;
menus?: {id:number;
name:string;
name_bn?:string;
route?:string;
child_menus?:{id:number;
name:string;
name_bn?:string;
route?:string}[]}[] };
type Dashboard = { business:{name:string;
slug:string;
category?:{name:string;
name_bn?:string}};
account:{name:string;
role:string};
branches_count:number;
modules?:Nav[] };
type Category = {id:number;
name:string;
name_bn?:string};
type Variant = {sku:string;
size:string;
color:string;
color_hex:string;
price:string;
stock:string};
type Product = {id:number;
name:string;
name_bn?:string;
price:number;
stock:number;
sku?:string;
category_id?:number;
is_active:boolean;
variants?:Variant[]};
const blankVariant = ():Variant=>({sku:"",size:"",color:"",color_hex:"",price:"",stock:"0"});
const Field=({label,value,onChange,type="text",placeholder=""}:{label:string;
value:string;
onChange:(v:string)=>void;
type?:string;
placeholder?:string})=>
<label
  className="block text-sm font-medium text-slate-700">{label}
  <input
  required={label.includes("*")}
  value={value}
  onChange={e=>onChange(e.target.value)}
  type={type} placeholder={placeholder}
  className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
</label>;

export default function ShopAdminHome({language}:{language:Language}) {
const {changeLanguage}=useLanguage();
const t=(en:string,bn:string)=>language==="bn"?bn||en:en;
const localized=(entry:{name:string;
name_bn?:string})=>language==="bn"?(entry.name_bn||entry.name):entry.name;
const [dashboard,setDashboard]=useState<Dashboard|null>(null);
const [categories,setCategories]=useState<Category[]>([]);
const [products,setProducts]=useState<Product[]>([]);
const [tab,setTab]=useState<"overview"|"products"|"categories">("overview");
const [drawer,setDrawer]=useState(false);
const [expandedModule,setExpandedModule]=useState<number|null>(null);
const [expandedMenu,setExpandedMenu]=useState<string|null>(null);
const [activeRoute,setActiveRoute]=useState("");
const [error,setError]=useState("");
const [notice,setNotice]=useState("");
const [saving,setSaving]=useState(false);
const [search,setSearch]=useState("");
const [categoryForm,setCategoryForm]=useState({name:"",name_bn:""});
const [form,setForm]=useState({name:"",name_bn:"",sku:"",description:"",image_url:"",category_id:"",price:"",stock:"0"});
const [variants,setVariants]=useState<Variant[]>([]);
const [loading,setLoading]=useState(true);
const refresh=async()=>{
 const [a,b]=await Promise.all([api.get<Dashboard>("/shop-admin/dashboard"),api.get<{categories:Category[];products:Product[]}>("/retail/admin/catalog")]);
 setDashboard(a.data);
 setCategories(Array.isArray(b.data.categories)?b.data.categories:[]);
 setProducts(Array.isArray(b.data.products)?b.data.products:[]);
};
useEffect(()=>{
 let mounted=true;
 Promise.all([api.get<Dashboard>("/shop-admin/dashboard"),api.get<{categories:Category[];products:Product[]}>("/retail/admin/catalog")])
 .then(([a,b])=>{if(!mounted)return;setDashboard(a.data);setCategories(Array.isArray(b.data.categories)?b.data.categories:[]);setProducts(Array.isArray(b.data.products)?b.data.products:[]);})
 .catch((e)=>{if(!mounted)return;if([401,403].includes(e?.response?.status)){localStorage.removeItem(TOKEN_KEY);sessionStorage.removeItem(TOKEN_KEY);localStorage.removeItem(USER_KEY);sessionStorage.removeItem(USER_KEY);window.location.replace("/login");return;}setError(e?.response?.data?.message||t("Unable to load retail workspace.","রিটেইল ওয়ার্কস্পেস লোড করা যায়নি।"));})
 .finally(()=>{if(mounted)setLoading(false);});
 return()=>{mounted=false;};
},[]);
const submitCategory=async(e:React.FormEvent)=>{e.preventDefault();
setSaving(true);
setError("");
try{await api.post("/retail/admin/categories",categoryForm);
setCategoryForm({name:"",name_bn:""});
await refresh();
setNotice(t("Category created.","ক্যাটাগরি তৈরি হয়েছে।"));
}catch(e:any){setError(e?.response?.data?.message||t("Unable to save category.","ক্যাটাগরি সংরক্ষণ করা যায়নি।"));
}finally{setSaving(false);
}};
const submitProduct=async(e:React.FormEvent)=>{e.preventDefault();
setSaving(true);
setError("");
try{await api.post("/retail/admin/products",{...form,category_id:form.category_id?Number(form.category_id):null,price:Number(form.price),stock:Number(form.stock),variants:variants.map(v=>({...v,price:Number(v.price),stock:Number(v.stock),color_hex:v.color_hex||null}))});
setForm({name:"",name_bn:"",sku:"",description:"",image_url:"",category_id:"",price:"",stock:"0"});
setVariants([]);
await refresh();
setNotice(t("Product published.","পণ্য প্রকাশিত হয়েছে।"));
}catch(e:any){setError(e?.response?.data?.message||t("Unable to save product.","পণ্য সংরক্ষণ করা যায়নি।"));
}finally{setSaving(false);
}};
const removeProduct=async(id:number)=>{if(!window.confirm(t("Delete this product?","এই পণ্যটি মুছে ফেলবেন?")))return;
try{await api.delete(`/retail/admin/products/${id}`);
await refresh();
setNotice(t("Product deleted.","পণ্য মুছে ফেলা হয়েছে।"));
}catch{setError(t("Could not delete product.","পণ্যটি মুছে ফেলা যায়নি।"));
}};
const logout=async()=>{try{await api.post("/auth/logout");
}catch{/* local token always cleared */}localStorage.removeItem(TOKEN_KEY);
sessionStorage.removeItem(TOKEN_KEY);
localStorage.removeItem(USER_KEY);
sessionStorage.removeItem(USER_KEY);
window.location.replace("/login");
};
const domain=tenantSlug!=="main"?tenantUrl(tenantSlug):"/";
const visible=useMemo(()=>products.filter(p=>(p.name+" "+(p.name_bn||"")+" "+(p.sku||"")).toLowerCase().includes(search.trim().toLowerCase())),[products,search]);
const navigate=(route?:string)=>{
 if(!route)return;
 setActiveRoute(route);
 const routePath=route.trim();
 if(/(^|\/)products?(\/|$)/i.test(routePath)){setTab("products");setDrawer(false);return;}
 if(/(^|\/)categor(?:y|ies)(\/|$)/i.test(routePath)){setTab("categories");setDrawer(false);return;}
 if(routePath==="/dashboard"||routePath==="dashboard"){setTab("overview");setDrawer(false);return;}
 if(/^https?:\/\//i.test(routePath)){
  try{const url=new URL(routePath);if(url.origin===window.location.origin)window.location.assign(url.pathname+url.search+url.hash);}catch{setError(t("Invalid menu URL.","মেনুর URL সঠিক নয়।"));}
 }else if(routePath.startsWith("/")&&!routePath.startsWith("//")){window.location.assign(routePath);}
 else{setError(t("Invalid menu route.","মেনুর রাউট সঠিক নয়।"));}
};
const toggleModule=(id:number)=>{
 setExpandedModule(current=>current===id?null:id);
 setExpandedMenu(null);
};
const toggleMenu=(moduleId:number,menuId:number)=>{
 const key=`${moduleId}:${menuId}`;
 setExpandedMenu(current=>current===key?null:key);
};
const sidebar=(
 <div className="flex h-full min-h-0 flex-col bg-[#10182d] text-white">
  <div className="flex shrink-0 items-center gap-3 border-b border-white/[0.08] px-5 py-5">
   <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-500 shadow-lg shadow-indigo-500/20"><Store size={21}/></div>
   <div className="min-w-0 flex-1">
    <p className="truncate text-[15px] font-bold tracking-tight">{dashboard?.business.name||tenantSlug}</p>
    <p className="mt-0.5 truncate text-[11px] text-slate-400">{t("Shop management","শপ ম্যানেজমেন্ট")}</p>
   </div>
   <button type="button" className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden" onClick={()=>setDrawer(false)} aria-label={t("Close menu","মেনু বন্ধ করুন")}><X size={19}/></button>
  </div>
  <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 py-5 [scrollbar-width:thin] [scrollbar-color:#475569_transparent]">

   <section>
    <div className="mb-2 flex items-center justify-between px-3">
     <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{t("Business modules","ব্যবসার মডিউল")}</p>
     <Layers3 size={13} className="text-slate-600"/>
    </div>
    <div className="space-y-1">
     {dashboard?.modules?.length?dashboard.modules.map(module=>{
      const opened=expandedModule===module.id;
      return <div key={module.id} className={`overflow-hidden rounded-xl transition-colors ${opened?"bg-white/[0.055]":""}`}>
       <button type="button" onClick={()=>module.menus?.length?toggleModule(module.id):navigate(module.route)} aria-expanded={module.menus?.length?opened:undefined} className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[13px] font-semibold transition-colors ${opened?"text-white":"text-slate-300 hover:bg-white/[0.07] hover:text-white"}`}>
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${opened?"bg-indigo-500/20 text-indigo-300":"bg-white/[0.06] text-slate-400 group-hover:text-indigo-300"}`}><Layers3 size={16}/></span>
        <span className="min-w-0 flex-1 truncate">{localized(module)}</span>
        {module.menus?.length?(<ChevronDown size={15} className={`shrink-0 text-slate-500 transition-transform duration-200 ${opened?"rotate-180 text-indigo-300":""}`}/>):(<ChevronRight size={15} className="shrink-0 text-slate-500"/>)}
       </button>
       {opened&&!!module.menus?.length&&<div className="mb-2 ml-7 mr-2 border-l border-white/10 pl-3">
        {module.menus.map(menu=>{
         const menuKey=`${module.id}:${menu.id}`;
         const hasChildren=!!menu.child_menus?.length;
         const menuOpen=expandedMenu===menuKey;
         const menuActive=!!menu.route&&activeRoute===menu.route;
         return <div key={menu.id} className="mt-1">
          <button type="button" aria-expanded={hasChildren?menuOpen:undefined} onClick={()=>hasChildren?toggleMenu(module.id,menu.id):navigate(menu.route)} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[12px] transition-colors ${menuActive||menuOpen?"bg-indigo-500/15 font-semibold text-indigo-200":"text-slate-400 hover:bg-white/[0.07] hover:text-white"}`}>
           <span className="min-w-0 flex-1 truncate">{localized(menu)}</span>
           {hasChildren?<ChevronDown size={13} className={`shrink-0 transition-transform duration-200 ${menuOpen?"rotate-180":""}`}/>:<ChevronRight size={12} className="shrink-0 opacity-50"/>}
          </button>
          {hasChildren&&menuOpen&&<div className="ml-2 space-y-0.5 border-l border-indigo-400/20 py-1 pl-2">
           {menu.child_menus!.map(child=><button type="button" key={child.id} onClick={()=>navigate(child.route)} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] transition-colors ${child.route&&activeRoute===child.route?"bg-indigo-500/20 font-medium text-white":"text-slate-400 hover:bg-white/[0.07] hover:text-white"}`}><span className={`h-1.5 w-1.5 shrink-0 rounded-full ${child.route&&activeRoute===child.route?"bg-indigo-400":"bg-slate-600"}`}/><span className="min-w-0 flex-1 truncate">{localized(child)}</span></button>)}
          </div>}
         </div>;
        })}
       </div>}
      </div>;
     }):<p className="px-3 py-3 text-xs leading-5 text-slate-500">{t("No modules available.","কোনো মডিউল পাওয়া যায়নি।")}</p>}
    </div>
   </section>
  </div>
  <div className="shrink-0 border-t border-white/[0.08] p-3">
   <div className="flex items-center gap-3 rounded-xl bg-white/[0.055] p-3">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/25 text-sm font-bold text-indigo-100">{dashboard?.account.name?.[0]||"A"}</span>
    <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-white">{dashboard?.account.name||t("Account","অ্যাকাউন্ট")}</p><p className="truncate text-[11px] text-slate-400">{dashboard?.account.role||t("Shop admin","শপ অ্যাডমিন")}</p></div>
    <button type="button" title={t("Log out","লগ আউট")} aria-label={t("Log out","লগ আউট")} onClick={logout} className="rounded-lg p-2 text-slate-400 hover:bg-rose-500/15 hover:text-rose-300"><LogOut size={17}/></button>
   </div>
  </div>
 </div>
);
return (
<div className="min-h-screen bg-[#f5f7fb] text-slate-900">
  <aside
    className="fixed inset-y-0 left-0 z-40 hidden w-72 overflow-hidden bg-[#10182d] text-white lg:block">{sidebar}
  </aside>{drawer&&
  <div
    className="fixed inset-0 z-50 bg-black/40 lg:hidden"
    onClick={()=>setDrawer(false)}>
    <aside
      className="h-full w-[min(19rem,85vw)] overflow-hidden bg-[#10182d] text-white"
      onClick={e=>e.stopPropagation()}>{sidebar}
    </aside>
  </div>}
  <div
    className="lg:pl-72">
    <header
      className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur lg:px-10">
      <div
        className="flex items-center gap-3">
        <button
          className="lg:hidden"
          onClick={()=>setDrawer(true)}
          aria-label={t("Open menu","মেনু খুলুন")}>
          <Menu/>
        </button>
        <div>
          <p
            className="text-xs text-slate-500">{t("Retail / Management","রিটেইল / ম্যানেজমেন্ট")}
          </p>
          <h1
            className="text-xl font-bold tracking-tight">{tab==="overview"?t("Dashboard","ড্যাশবোর্ড"):tab==="products"?t("Product management","পণ্য ব্যবস্থাপনা"):t("Categories","ক্যাটাগরি")}
          </h1>
        </div>
      </div>
      <div
        className="flex items-center gap-3">
        <LanguageSwitcher language={language}
        onChange={changeLanguage}/>
        <a
        href={domain}
        target="_blank"
        rel="noreferrer"
        className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold sm:inline-flex">
        <ExternalLink size={15}/>{t("View shop","শপ দেখুন")}</a>
        <button
          onClick={logout}
          className="rounded-xl bg-slate-100 p-3"
          title={t("Log out","লগ আউট")}>
          <LogOut size={18}/>
        </button>
        <span
          className="hidden h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700 sm:flex">{dashboard?.account.name?.[0]||"A"}
        </span>
      </div>
    </header>
    <main
      className="mx-auto max-w-7xl space-y-6 p-5 lg:p-10">{loading&&<p role="status" className="rounded-xl bg-white p-5 text-sm text-slate-500">{t("Loading workspace...","ওয়ার্কস্পেস লোড হচ্ছে...")}</p>}{error&&
      <div role="alert"
        className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}
        <button
          className="float-right"
          onClick={()=>setError("")}>
          <X size={16}/>
        </button>
      </div>}{notice&&
      <div
        className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">{notice}
        <button
          className="float-right"
          onClick={()=>setNotice("")}>
          <X size={16}/>
        </button>
      </div>}{tab==="overview"&&
      <>
      <section
        className="rounded-3xl bg-gradient-to-br from-[#192a60] to-[#4540b7] p-8 text-white shadow-lg">
        <p
          className="text-sm text-indigo-100">{t("Welcome back","আবারও স্বাগতম")}, {dashboard?.account.name||""}
        </p>
        <h2
          className="mt-3 text-3xl font-bold">{t("Your store, all in one place.","আপনার স্টোর, সবকিছু এক জায়গায়।")}
        </h2>
        <p
          className="mt-3 max-w-xl text-sm text-indigo-100">{t("Manage products, categories, availability and your customer-facing store.","পণ্য, ক্যাটাগরি, স্টক এবং কাস্টমার স্টোর পরিচালনা করুন।")}
        </p>
        <button
          onClick={()=>setTab("products")}
          className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-800">{t("Manage products","পণ্য পরিচালনা")}
        </button>
      </section>
      <div
        className="grid gap-4 md:grid-cols-3">{[[t("Total products","মোট পণ্য"),products.length,Package],[t("Categories","ক্যাটাগরি"),categories.length,FolderTree],[t("Branches","ব্রাঞ্চ"),dashboard?.branches_count||0,Store]].map(([label,count,Icon],i)=>
        <div
          key={i}
          className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <Icon
          className="text-indigo-600"/>
          <p
            className="mt-4 text-sm text-slate-500">{label as string}
          </p>
          <p
            className="mt-1 text-3xl font-bold">{count as number}
          </p>
        </div>)}
      </div>
    </>}{tab==="categories"&&
    <div
      className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <form onSubmit={submitCategory}
        className="h-fit space-y-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2
          className="text-lg font-bold">{t("Add category","ক্যাটাগরি যোগ করুন")}
        </h2>
        <Field label={t("Category name *","ক্যাটাগরির নাম *")}
        value={categoryForm.name}
        onChange={v=>setCategoryForm({...categoryForm,name:v})}/>
        <Field label={t("Bangla name","বাংলা নাম")}
        value={categoryForm.name_bn}
        onChange={v=>setCategoryForm({...categoryForm,name_bn:v})}/>
        <button
          disabled={saving}
          className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{t("Save category","ক্যাটাগরি সংরক্ষণ করুন")}
        </button>
      </form>
      <div
        className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2
          className="mb-5 text-lg font-bold">{t("Your categories","আপনার ক্যাটাগরি")}
        </h2>{categories.map(c=>
        <div
          key={c.id}
          className="flex items-center justify-between border-b border-slate-100 py-4">
          <span>{localized(c)}
          </span>
          <span
            className="text-xs text-slate-400">#{c.id}
          </span>
        </div>)}{categories.length===0&&
        <p
          className="text-sm text-slate-500">{t("No categories yet.","এখনো কোনো ক্যাটাগরি নেই।")}
        </p>}
      </div>
    </div>}{tab==="products"&&
    <div
      className="grid gap-6 2xl:grid-cols-[450px_1fr]">
      <form onSubmit={submitProduct}
        className="h-fit space-y-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div
          className="flex items-center gap-2">
          <CirclePlus
          className="text-indigo-600"/>
          <h2
            className="text-lg font-bold">{t("Add a product","পণ্য যোগ করুন")}
          </h2>
        </div>
        <div
          className="grid gap-4 sm:grid-cols-2">
          <Field label={t("Product name *","পণ্যের নাম *")}
          value={form.name}
          onChange={v=>setForm({...form,name:v})}/>
          <Field label={t("Bangla name","বাংলা নাম")}
          value={form.name_bn}
          onChange={v=>setForm({...form,name_bn:v})}/>
        </div>
        <label
          className="block text-sm font-medium">{t("Category","ক্যাটাগরি")}
          <select
            value={form.category_id}
            onChange={e=>setForm({...form,category_id:e.target.value})}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm">
            <option
              value="">{t("Select category","ক্যাটাগরি নির্বাচন করুন")}
            </option>{categories.map(c=>
            <option
              key={c.id}
              value={c.id}>{localized(c)}
            </option>)}
          </select>
        </label>
        <Field label={t("SKU","এসকেইউ")}
        value={form.sku}
        onChange={v=>setForm({...form,sku:v})}/>
        <Field label={t("Image URL","ছবির ইউআরএল")}
        value={form.image_url}
        onChange={v=>setForm({...form,image_url:v})}/>
        <div
          className="grid grid-cols-2 gap-4">
          <Field label={t("Base price *","মূল মূল্য *")}
          value={form.price}
          onChange={v=>setForm({...form,price:v})}
          type="number"/>
          <Field label={t("Base stock *","মূল স্টক *")}
          value={form.stock}
          onChange={v=>setForm({...form,stock:v})}
          type="number"/>
        </div>
        <label
          className="block text-sm font-medium">{t("Description","বিবরণ")}
          <textarea
            value={form.description}
            onChange={e=>setForm({...form,description:e.target.value})}
            className="mt-2 h-24 w-full rounded-xl border border-slate-200 p-3 text-sm" />
          </label>
          <div
            className="rounded-2xl bg-slate-50 p-4">
            <div
              className="flex items-center justify-between gap-2">
              <div>
                <p
                  className="font-bold">{t("Size / Color variants","সাইজ / রঙ ভ্যারিয়েন্ট")}
                </p>
                <p
                  className="mt-1 text-xs text-slate-500">{t("Optional — leave empty for a simple product.","ঐচ্ছিক — সাধারণ পণ্যের জন্য খালি রাখুন।")}
                </p>
              </div>
              <button
                type="button"
                onClick={()=>setVariants(v=>[...v,blankVariant()])}
                className="flex items-center gap-1 rounded-lg bg-indigo-100 px-3 py-2 text-xs font-semibold text-indigo-800">
                <CirclePlus size={14}/>{t("Add","যোগ")}
              </button>
            </div>{variants.map((v,i)=>
            <div
              key={i}
              className="mt-4 space-y-3 rounded-xl border bg-white p-3">
              <div
                className="flex justify-between text-sm font-semibold">
                <span>{t("Variant","ভ্যারিয়েন্ট")} {i+1}
                </span>
                <button
                  type="button"
                  onClick={()=>setVariants(old=>old.filter((_,j)=>j!==i))}>
                  <X size={16}/>
                </button>
              </div>
              <div
                className="grid grid-cols-2 gap-2">{(["sku","size","color","color_hex","price","stock"] as const).map(key=>
                <label
                  key={key}
                  className="text-xs capitalize text-slate-600">{({sku:t("SKU","এসকেইউ"),size:t("Size","সাইজ"),color:t("Color","রঙ"),color_hex:t("Color hex","রঙের হেক্স"),price:t("Price","মূল্য"),stock:t("Stock","স্টক")})[key]}
                  <input
                  value={v[key]}
                  onChange={e=>setVariants(old=>old.map((x,j)=>j===i?{...x,[key]:e.target.value}:x))}
                  required={key==="sku"||key==="price"||key==="stock"}
                  type={key==="price"||key==="stock"?"number":"text"}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm" />
                </label>)}
              </div>
            </div>)}
          </div>
          <button
            disabled={saving}
            className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white shadow-sm disabled:opacity-50">{saving?t("Saving...","সংরক্ষণ হচ্ছে..."):t("Create product","পণ্য তৈরি করুন")}
          </button>
        </form>
        <div
          className="min-w-0 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div
            className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2
              className="text-lg font-bold">{t("Product catalog","পণ্য ক্যাটালগ")}
            </h2>
            <div
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
              <Search size={17}/>
              <input
              value={search}
              onChange={e=>setSearch(e.target.value)} placeholder={t("Search products","পণ্য খুঁজুন")}
              className="w-36 text-sm outline-none" />
            </div>
          </div>
          <div
            className="space-y-3">{visible.map(p=>
            <article
              key={p.id}
              className="flex items-start gap-4 rounded-xl border border-slate-100 p-4">
              <div
                className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <ShoppingBag size={23}/>
              </div>
              <div
                className="min-w-0 flex-1">
                <h3
                  className="font-semibold">{localized(p)}
                </h3>
                <p
                  className="mt-1 text-xs text-slate-500">{p.sku||"—"} · {p.variants?.length?`${p.variants.length} ${t("variants","ভ্যারিয়েন্ট")}`:`${p.stock} ${t("in stock","স্টকে আছে")}`}
                </p>
                <p
                  className="mt-2 text-sm font-bold text-indigo-700">৳{p.price}
                </p>
              </div>
              <button
                onClick={()=>removeProduct(p.id)}
                className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"
                title={t("Delete","মুছুন")}>
                <Trash2 size={17}/>
              </button>
            </article>)}{visible.length===0&&
            <p
              className="py-16 text-center text-sm text-slate-500">{t("No products to show.","দেখানোর মতো কোনো পণ্য নেই।")}
            </p>}
          </div>
        </div>
      </div>}
    </main>
  </div>
</div>
);
}
