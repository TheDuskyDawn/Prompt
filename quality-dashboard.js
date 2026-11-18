async function loadQualityDashboard(){
  const root=document.querySelector("#quality-dashboard");
  try{
    const response=await fetch("data/resources.json");
    if(!response.ok) throw new Error("Catalogue unavailable");
    const resources=await response.json();
    const counts={
      total:resources.length,
      qualityPending:resources.filter(x=>!x.quality_review||x.quality_review.status==="not-assessed").length,
      reviewPending:resources.filter(x=>!x.review_record||x.review_record.status==="not-reviewed").length,
      stale:resources.filter(x=>{const r=x.review_record||{};if(!r.reviewed_at)return false;const t=Date.parse(r.reviewed_at+"T00:00:00Z");const d=(Number.isInteger(r.review_interval_days)&&r.review_interval_days>0?r.review_interval_days:180)*86400000;return Number.isFinite(t)&&Date.now()>t+d;}).length,
      untested:resources.filter(x=>!x.testing||x.testing.status==="untested").length,
      compatibility:resources.filter(x=>x.compatibility?.length).length,
      examples:resources.filter(x=>x.expected_output).length,
      failureNotes:resources.filter(x=>x.failure_modes?.length).length,
      versioned:resources.filter(x=>x.version_history?.length).length
    };
    const rows=[
      ["Resources in catalogue",counts.total],
      ["Quality rubric not assessed",counts.qualityPending],
      ["Content review not recorded",counts.reviewPending],
      ["Marked stale for review",counts.stale],
      ["Not model-tested",counts.untested],
      ["With model compatibility records",counts.compatibility],
      ["With expected-output examples",counts.examples],
      ["With documented failure modes",counts.failureNotes],
      ["With version history",counts.versioned]
    ];
    root.innerHTML='<div class="cards dashboard-cards">'+rows.map(([label,value])=>'<article class="card"><span class="kind">CATALOGUE STATUS</span><h3>'+value+'</h3><p>'+label+'</p></article>').join("")+'</div><p class="detailmeta">Generated from the public catalogue. Empty evidence fields mean evidence has not yet been recorded; they are not claims of failure or incompatibility.</p>';
  }catch(error){root.textContent="The dashboard could not load the catalogue. Please try again later.";}
}
loadQualityDashboard();
