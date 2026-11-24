export type CategoryId =
  | 'mechanics'
  | 'waves'
  | 'electromagnetism'
  | 'thermodynamics'
  | 'modern_physics';

export interface ParameterSpec {
  key: string;
  symbol: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  description?: string;
}

export interface VectorToggleSpec {
  id: string;
  label: string;
  symbol: string;
  color: string;
  defaultVisible: boolean;
}

export interface TelemetryMetric {
  label: string;
  symbol: string;
  value: string;
  unit: string;
  color?: string;
}

export interface DynamicEquation {
  title: string;
  latexFormula: string;
  liveSubstitution: string;
  resultText: string;
}

export interface GraphTraceSpec {
  key: string;
  label: string;
  unit: string;
  color: string;
}

export interface MissionSpec {
  id: string;
  title: string;
  description: string;
  hint: string;
  checkPassed: (params: Record<string, number>, telemetry: Record<string, number>) => {
    passed: boolean;
    progressText: string;
  };
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface PhysicsModule {
  id: string;
  code: string;
  number: string;
  title: string;
  subtitle: string;
  gradeLevel: 'ม.4' | 'ม.5' | 'ม.6';
  category: CategoryId;
  parameters: ParameterSpec[];
  vectors: VectorToggleSpec[];
  graphTitle: string;
  graphXLabel: string;
  graphTraces: GraphTraceSpec[];
  theorySummary: string;
  keyTakeaways: string[];
  realWorldTitle: string;
  realWorldDescription: string;
  computeState: (
    params: Record<string, number>,
    time: number
  ) => {
    metrics: TelemetryMetric[];
    rawMetrics: Record<string, number>;
    equations: DynamicEquation[];
    graphPoint: Record<string, number>;
  };
  mission: MissionSpec;
  quiz: QuizQuestion;
}
