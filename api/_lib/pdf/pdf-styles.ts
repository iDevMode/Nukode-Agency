import { StyleSheet } from '@react-pdf/renderer';

// Brand colours
export const colors = {
  black: '#050505',
  darkGray: '#1a1a1a',
  mediumGray: '#4a4a4a',
  lightGray: '#666666',
  borderGray: '#e5e5e5',
  bgGray: '#f5f5f5',
  white: '#ffffff',
  blue: '#3b82f6',
  darkBlue: '#1e40af',
  lightBlue: '#eff6ff',
  green: '#16a34a',
  lightGreen: '#f0fdf4',
};

export const styles = StyleSheet.create({
  // Page
  page: {
    paddingTop: 50,
    paddingBottom: 60,
    paddingHorizontal: 50,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: colors.darkGray,
    lineHeight: 1.5,
  },
  coverPage: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    fontFamily: 'Helvetica',
  },

  // Cover page
  coverBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.black,
    padding: 60,
    justifyContent: 'space-between',
  },
  coverTopSection: {
    marginTop: 80,
  },
  coverBrandName: {
    fontSize: 18,
    color: colors.blue,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 3,
    marginBottom: 40,
  },
  coverTitle: {
    fontSize: 36,
    color: colors.white,
    fontFamily: 'Helvetica-Bold',
    lineHeight: 1.2,
    marginBottom: 15,
  },
  coverSubtitle: {
    fontSize: 14,
    color: colors.lightGray,
    lineHeight: 1.6,
  },
  coverBottomSection: {
    marginBottom: 40,
  },
  coverCompanyName: {
    fontSize: 20,
    color: colors.white,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 10,
  },
  coverDate: {
    fontSize: 12,
    color: colors.lightGray,
  },
  coverDivider: {
    width: 60,
    height: 3,
    backgroundColor: colors.blue,
    marginBottom: 20,
  },

  // Section headers
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: colors.black,
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: colors.blue,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: colors.darkGray,
    marginBottom: 8,
    marginTop: 15,
  },

  // Text
  paragraph: {
    fontSize: 10,
    color: colors.mediumGray,
    marginBottom: 10,
    lineHeight: 1.6,
  },
  boldText: {
    fontFamily: 'Helvetica-Bold',
  },
  smallText: {
    fontSize: 8,
    color: colors.lightGray,
  },

  // Metric callouts
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    gap: 12,
  },
  metricBox: {
    flex: 1,
    backgroundColor: colors.bgGray,
    borderRadius: 6,
    padding: 15,
    alignItems: 'center',
  },
  metricBoxHighlight: {
    flex: 1,
    backgroundColor: colors.lightBlue,
    borderRadius: 6,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.blue,
  },
  metricLabel: {
    fontSize: 8,
    color: colors.lightGray,
    textTransform: 'uppercase',
    marginBottom: 4,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: colors.black,
    textAlign: 'center',
  },
  metricValueBlue: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: colors.blue,
    textAlign: 'center',
  },

  // Tables
  table: {
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.black,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  tableRowAlt: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
    backgroundColor: colors.bgGray,
  },
  tableCell: {
    fontSize: 9,
    color: colors.mediumGray,
  },

  // Solution cards
  solutionCard: {
    backgroundColor: colors.bgGray,
    borderRadius: 6,
    padding: 18,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: colors.blue,
  },
  solutionTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: colors.black,
    marginBottom: 8,
  },
  solutionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderGray,
  },
  solutionMetaItem: {
    alignItems: 'center',
  },
  solutionMetaLabel: {
    fontSize: 7,
    color: colors.lightGray,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  solutionMetaValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: colors.blue,
  },

  // Roadmap
  phaseCard: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: colors.bgGray,
    borderRadius: 6,
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  phaseBadge: {
    backgroundColor: colors.blue,
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    marginRight: 10,
  },
  phaseBadgeText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
  },
  phaseName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: colors.black,
  },
  phaseDuration: {
    fontSize: 9,
    color: colors.lightGray,
    marginLeft: 'auto',
  },

  // Bullet lists
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 5,
  },
  bulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.blue,
    marginRight: 8,
    marginTop: 4,
  },
  bulletText: {
    fontSize: 9,
    color: colors.mediumGray,
    flex: 1,
  },

  // CTA section
  ctaBox: {
    backgroundColor: colors.blue,
    borderRadius: 8,
    padding: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  ctaTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: colors.white,
    marginBottom: 8,
  },
  ctaText: {
    fontSize: 10,
    color: colors.white,
    opacity: 0.9,
    marginBottom: 12,
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: colors.white,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 25,
  },
  ctaButtonText: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: colors.blue,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderGray,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: colors.lightGray,
  },
  footerBrand: {
    fontSize: 7,
    color: colors.blue,
    fontFamily: 'Helvetica-Bold',
  },

  // Disclaimer
  disclaimerBox: {
    backgroundColor: colors.bgGray,
    borderRadius: 6,
    padding: 15,
    marginTop: 20,
  },
  disclaimerTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: colors.mediumGray,
    marginBottom: 6,
  },
  disclaimerText: {
    fontSize: 8,
    color: colors.lightGray,
    lineHeight: 1.5,
  },

  // Tag / chip
  tag: {
    backgroundColor: colors.lightBlue,
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginRight: 4,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 8,
    color: colors.blue,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
});
