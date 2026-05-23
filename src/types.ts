export interface Rubric {
  baruBerkembang: string;
  layak: string;
  cakap: string;
  mahir: string;
}

export interface Indicator {
  name: string;
  aspect: string;
  rubric: Rubric;
}

export interface LearningObjective {
  tpNumber: number;
  objectiveText: string;
  soloTaxonomy: string;
  deepLearningAspect: string;
  allocatedJP: number;
  indicators: Indicator[];
  kktpMethod: string;
  pedagogicalNote: string;
}

export interface AnalysisResult {
  summary: string;
  totalTP: number;
  suggestedAllocations: string;
  learningObjectives: LearningObjective[];
  isSimulated?: boolean;
}

export interface InputFormData {
  schoolName: string;
  teacherName: string;
  principalName: string;
  academicYear: string;
  phase: string;
  semester: string;
  className: string;
  jp: number;
  cpText: string;
  atpText: string;
}
