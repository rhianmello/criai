import {readFileSync} from 'node:fs';

const args=process.argv.slice(2);
if(args.length!==2){console.error('Expected mobile and desktop reports');process.exit(2)}
for(const path of args){
  const report=JSON.parse(readFileSync(path,'utf8'));
  if(report.runtimeError){console.error(path,report.runtimeError);process.exitCode=1;continue}
  const cats=Object.fromEntries(Object.entries(report.categories||{}).map(([k,v])=>[k,v.score==null?null:Math.round(v.score*100)]));
  const audits={};
  for (const key of ['first-contentful-paint','largest-contentful-paint','total-blocking-time','cumulative-layout-shift','speed-index','server-response-time']) {
    const a=report.audits?.[key];
    audits[key]=a?{display:a.displayValue,score:a.score}:null;
  }
  console.log(JSON.stringify({report:path,requestedUrl:report.requestedUrl,finalDisplayedUrl:report.finalDisplayedUrl,lighthouseVersion:report.lighthouseVersion,categories:cats,labMetrics:audits},null,2));
  if(!report.finalDisplayedUrl?.startsWith('https://criai.xrmovi.com.br/'))process.exitCode=1;
}
console.log('Scores are lab results from one GitHub runner, NOT field Core Web Vitals.');
