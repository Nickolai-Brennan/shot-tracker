import WorkspaceSections from '../workspace-sections';
const routes=new Set(['players','courses','events','player-profile','course-profile','event-details','bulk-download','round-tracker','stats-values']);
export default async function SectionPage({params}:{params:Promise<{section:string}>}){
 const {section}=await params;
 if(!routes.has(section))return <main><h1>Page unavailable</h1><a href="/">Return to Shot Lab</a></main>;
 return <WorkspaceSections section={section}/>;
}
