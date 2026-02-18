import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { styles, colors } from './pdf-styles';
import type { ComprehensiveROIAnalysis } from '../gemini-comprehensive';
import type { ROIMetrics } from '../roi-calculator';

interface ReportProps {
  companyName: string;
  analysis: ComprehensiveROIAnalysis;
  metrics: ROIMetrics;
  generatedDate: string;
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function renderBullet(text: string, idx: number) {
  return (
    <View key={idx} style={styles.bulletItem}>
      <View style={styles.bulletDot} />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

function PageFooter({ companyName }: { companyName: string }) {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>Confidential — Prepared for {companyName}</Text>
      <Text style={styles.footerBrand}>NUKODE</Text>
      <Text style={styles.footerText}>nukode.co.uk</Text>
    </View>
  );
}

// ============================================================================
// COVER PAGE
// ============================================================================

function CoverPage({ companyName, generatedDate }: { companyName: string; generatedDate: string }) {
  return (
    <Page size="A4" style={styles.coverPage}>
      <View style={styles.coverBackground}>
        <View style={styles.coverTopSection}>
          <Text style={styles.coverBrandName}>NUKODE</Text>
          <Text style={styles.coverTitle}>AI Automation{'\n'}Audit Report</Text>
          <Text style={styles.coverSubtitle}>
            A comprehensive analysis of automation opportunities,{'\n'}
            projected ROI, and implementation roadmap.
          </Text>
        </View>
        <View style={styles.coverBottomSection}>
          <View style={styles.coverDivider} />
          <Text style={styles.coverCompanyName}>{companyName}</Text>
          <Text style={styles.coverDate}>{generatedDate}</Text>
        </View>
      </View>
    </Page>
  );
}

// ============================================================================
// EXECUTIVE SUMMARY PAGE
// ============================================================================

function ExecutiveSummaryPage({ analysis, metrics, companyName }: {
  analysis: ComprehensiveROIAnalysis;
  metrics: ROIMetrics;
  companyName: string;
}) {
  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>Executive Summary</Text>
      <Text style={[styles.sectionSubtitle, { color: colors.blue, fontSize: 16, marginTop: 0 }]}>
        {analysis.executiveSummary.headline}
      </Text>
      <Text style={styles.paragraph}>{analysis.executiveSummary.overview}</Text>

      <View style={styles.metricRow}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Weekly Manual Hours</Text>
          <Text style={styles.metricValue}>{metrics.totalWeeklyHours}h</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Annual Manual Cost</Text>
          <Text style={styles.metricValue}>{formatCurrency(metrics.annualLaborCost)}</Text>
        </View>
        <View style={styles.metricBoxHighlight}>
          <Text style={styles.metricLabel}>Projected Savings</Text>
          <Text style={styles.metricValueBlue}>{analysis.executiveSummary.toplineROI}</Text>
        </View>
      </View>

      <Text style={[styles.paragraph, { fontFamily: 'Helvetica-Bold', color: colors.darkGray, marginTop: 5 }]}>
        {analysis.executiveSummary.toplineROI}
      </Text>

      <PageFooter companyName={companyName} />
    </Page>
  );
}

// ============================================================================
// CURRENT STATE ASSESSMENT PAGE
// ============================================================================

function CurrentStatePage({ analysis, companyName }: {
  analysis: ComprehensiveROIAnalysis;
  companyName: string;
}) {
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>Current State Assessment</Text>
      <Text style={styles.paragraph}>{analysis.currentStateAssessment.operationalOverview}</Text>

      <Text style={styles.sectionSubtitle}>Pain Point Analysis</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { width: '30%' }]}>Pain Point</Text>
          <Text style={[styles.tableHeaderCell, { width: '45%' }]}>Impact</Text>
          <Text style={[styles.tableHeaderCell, { width: '25%', textAlign: 'right' }]}>Est. Annual Cost</Text>
        </View>
        {analysis.currentStateAssessment.painPointAnalysis.map((pp, i) => (
          <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
            <Text style={[styles.tableCell, { width: '30%', fontFamily: 'Helvetica-Bold' }]}>{pp.painPoint}</Text>
            <Text style={[styles.tableCell, { width: '45%' }]}>{pp.impact}</Text>
            <Text style={[styles.tableCell, { width: '25%', textAlign: 'right', color: colors.blue, fontFamily: 'Helvetica-Bold' }]}>
              {pp.estimatedCostPerYear}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionSubtitle}>Process Inefficiencies</Text>
      <Text style={styles.paragraph}>{analysis.currentStateAssessment.processInefficiencies}</Text>

      <PageFooter companyName={companyName} />
    </Page>
  );
}

// ============================================================================
// RECOMMENDED SOLUTIONS PAGES
// ============================================================================

function RecommendedSolutionsPage({ analysis, companyName }: {
  analysis: ComprehensiveROIAnalysis;
  companyName: string;
}) {
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>Recommended Solutions</Text>
      <Text style={styles.paragraph}>
        Based on the analysis, we recommend the following AI automation solutions for {companyName}:
      </Text>

      {analysis.recommendedSolutions.map((sol, i) => (
        <View key={i} style={styles.solutionCard} wrap={false}>
          <Text style={styles.solutionTitle}>
            {i + 1}. {sol.solutionName}
          </Text>
          <Text style={styles.paragraph}>{sol.description}</Text>

          <Text style={[styles.smallText, { fontFamily: 'Helvetica-Bold', marginBottom: 4 }]}>Processes Addressed:</Text>
          <View style={styles.tagRow}>
            {sol.processesAddressed.map((p, j) => (
              <View key={j} style={styles.tag}>
                <Text style={styles.tagText}>{p}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.smallText, { marginBottom: 6 }]}>
            <Text style={{ fontFamily: 'Helvetica-Bold' }}>Tech Stack: </Text>
            {sol.technologyStack}
          </Text>

          <View style={styles.solutionMeta}>
            <View style={styles.solutionMetaItem}>
              <Text style={styles.solutionMetaLabel}>Complexity</Text>
              <Text style={styles.solutionMetaValue}>{sol.implementationComplexity}</Text>
            </View>
            <View style={styles.solutionMetaItem}>
              <Text style={styles.solutionMetaLabel}>Time Saved</Text>
              <Text style={styles.solutionMetaValue}>{sol.expectedTimeSavingsHoursPerWeek}h/week</Text>
            </View>
            <View style={styles.solutionMetaItem}>
              <Text style={styles.solutionMetaLabel}>Annual Savings</Text>
              <Text style={styles.solutionMetaValue}>{sol.expectedCostSavingsPerYear}</Text>
            </View>
          </View>
        </View>
      ))}

      <PageFooter companyName={companyName} />
    </Page>
  );
}

// ============================================================================
// IMPLEMENTATION ROADMAP PAGE
// ============================================================================

function RoadmapPage({ analysis, companyName }: {
  analysis: ComprehensiveROIAnalysis;
  companyName: string;
}) {
  const phases = [
    { label: 'Phase 1', data: analysis.implementationRoadmap.phase1 },
    { label: 'Phase 2', data: analysis.implementationRoadmap.phase2 },
    { label: 'Phase 3', data: analysis.implementationRoadmap.phase3 },
  ];

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>Implementation Roadmap</Text>
      <Text style={styles.paragraph}>
        A structured three-phase approach to ensure smooth deployment, rapid ROI, and long-term scalability.
      </Text>

      {phases.map((phase, i) => (
        <View key={i} style={styles.phaseCard} wrap={false}>
          <View style={styles.phaseHeader}>
            <View style={styles.phaseBadge}>
              <Text style={styles.phaseBadgeText}>{phase.label}</Text>
            </View>
            <Text style={styles.phaseName}>{phase.data.name}</Text>
            <Text style={styles.phaseDuration}>{phase.data.duration}</Text>
          </View>

          <Text style={[styles.smallText, { fontFamily: 'Helvetica-Bold', marginBottom: 4 }]}>Activities:</Text>
          {phase.data.activities.map((a, j) => renderBullet(a, j))}

          <Text style={[styles.smallText, { fontFamily: 'Helvetica-Bold', marginBottom: 4, marginTop: 8 }]}>Deliverables:</Text>
          {phase.data.deliverables.map((d, j) => renderBullet(d, j))}
        </View>
      ))}

      <PageFooter companyName={companyName} />
    </Page>
  );
}

// ============================================================================
// FINANCIAL ANALYSIS PAGE
// ============================================================================

function FinancialAnalysisPage({ analysis, companyName }: {
  analysis: ComprehensiveROIAnalysis;
  companyName: string;
}) {
  const fa = analysis.financialAnalysis;

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>Financial Analysis</Text>

      <View style={styles.metricRow}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Current Annual Cost</Text>
          <Text style={styles.metricValue}>{fa.currentAnnualCostOfManualWork}</Text>
        </View>
        <View style={styles.metricBoxHighlight}>
          <Text style={styles.metricLabel}>Conservative Savings</Text>
          <Text style={styles.metricValueBlue}>{fa.projectedSavingsConservative}</Text>
        </View>
        <View style={styles.metricBoxHighlight}>
          <Text style={styles.metricLabel}>Optimistic Savings</Text>
          <Text style={styles.metricValueBlue}>{fa.projectedSavingsOptimistic}</Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { width: '60%' }]}>Metric</Text>
          <Text style={[styles.tableHeaderCell, { width: '40%', textAlign: 'right' }]}>Value</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { width: '60%' }]}>Current Annual Cost of Manual Work</Text>
          <Text style={[styles.tableCell, { width: '40%', textAlign: 'right', fontFamily: 'Helvetica-Bold' }]}>
            {fa.currentAnnualCostOfManualWork}
          </Text>
        </View>
        <View style={styles.tableRowAlt}>
          <Text style={[styles.tableCell, { width: '60%' }]}>Projected Savings (Conservative, 30%)</Text>
          <Text style={[styles.tableCell, { width: '40%', textAlign: 'right', fontFamily: 'Helvetica-Bold', color: colors.green }]}>
            {fa.projectedSavingsConservative}
          </Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { width: '60%' }]}>Projected Savings (Optimistic, 50%)</Text>
          <Text style={[styles.tableCell, { width: '40%', textAlign: 'right', fontFamily: 'Helvetica-Bold', color: colors.green }]}>
            {fa.projectedSavingsOptimistic}
          </Text>
        </View>
        <View style={styles.tableRowAlt}>
          <Text style={[styles.tableCell, { width: '60%' }]}>Estimated Implementation Cost</Text>
          <Text style={[styles.tableCell, { width: '40%', textAlign: 'right', fontFamily: 'Helvetica-Bold' }]}>
            {fa.estimatedImplementationCost}
          </Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { width: '60%' }]}>Payback Period</Text>
          <Text style={[styles.tableCell, { width: '40%', textAlign: 'right', fontFamily: 'Helvetica-Bold', color: colors.blue }]}>
            {fa.paybackPeriodMonths} months
          </Text>
        </View>
        <View style={styles.tableRowAlt}>
          <Text style={[styles.tableCell, { width: '60%' }]}>3-Year ROI</Text>
          <Text style={[styles.tableCell, { width: '40%', textAlign: 'right', fontFamily: 'Helvetica-Bold', color: colors.blue }]}>
            {fa.threeYearROI}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionSubtitle}>Additional Benefits</Text>
      {fa.additionalBenefits.map((b, i) => renderBullet(b, i))}

      <PageFooter companyName={companyName} />
    </Page>
  );
}

// ============================================================================
// WHY NUKODE + CTA PAGE
// ============================================================================

function WhyNukodePage({ analysis, companyName }: {
  analysis: ComprehensiveROIAnalysis;
  companyName: string;
}) {
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>Why Nukode</Text>

      <Text style={styles.sectionSubtitle}>Industry Expertise</Text>
      <Text style={styles.paragraph}>{analysis.whyNukode.industryExpertise}</Text>

      <Text style={styles.sectionSubtitle}>Our Approach</Text>
      <Text style={styles.paragraph}>{analysis.whyNukode.approachDifferentiator}</Text>

      <Text style={styles.sectionSubtitle}>Next Steps</Text>
      {analysis.whyNukode.nextSteps.map((step, i) => renderBullet(step, i))}

      <View style={styles.ctaBox}>
        <Text style={styles.ctaTitle}>Ready to Get Started?</Text>
        <Text style={styles.ctaText}>
          Book a free 30-minute strategy call to discuss your personalised automation roadmap.
        </Text>
        <View style={styles.ctaButton}>
          <Text style={styles.ctaButtonText}>calendly.com/phil-shields92</Text>
        </View>
      </View>

      <View style={styles.disclaimerBox}>
        <Text style={styles.disclaimerTitle}>Methodology & Disclaimer</Text>
        <Text style={styles.disclaimerText}>
          This report was generated using AI-powered analysis based on the information provided in the audit questionnaire.
          Financial projections are estimates based on industry benchmarks and the data supplied. Actual results may vary
          depending on implementation specifics, organisational readiness, and market conditions. Conservative estimates
          assume 30% automation of manual processes; optimistic estimates assume 50%. Implementation costs are indicative
          and will be refined during the discovery phase. All figures are in GBP.
        </Text>
      </View>

      <PageFooter companyName={companyName} />
    </Page>
  );
}

// ============================================================================
// MAIN DOCUMENT
// ============================================================================

export function AuditReportDocument({ companyName, analysis, metrics, generatedDate }: ReportProps) {
  return (
    <Document
      title={`AI Automation Audit Report - ${companyName}`}
      author="Nukode"
      subject="AI Automation Audit"
    >
      <CoverPage companyName={companyName} generatedDate={generatedDate} />
      <ExecutiveSummaryPage analysis={analysis} metrics={metrics} companyName={companyName} />
      <CurrentStatePage analysis={analysis} companyName={companyName} />
      <RecommendedSolutionsPage analysis={analysis} companyName={companyName} />
      <RoadmapPage analysis={analysis} companyName={companyName} />
      <FinancialAnalysisPage analysis={analysis} companyName={companyName} />
      <WhyNukodePage analysis={analysis} companyName={companyName} />
    </Document>
  );
}
