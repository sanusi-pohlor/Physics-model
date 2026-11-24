import { CategoryId, PhysicsModule } from '../types/physics';

export const CATEGORIES: Array<{
  id: CategoryId;
  title: string;
  grade: string;
  color: string;
  badgeClass: string;
}> = [
  {
    id: 'mechanics',
    title: 'หมวด 1: กลศาสตร์',
    grade: 'ม.4',
    color: '#22d3ee',
    badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  },
  {
    id: 'waves',
    title: 'หมวด 2: คลื่น เสียง และแสง',
    grade: 'ม.5',
    color: '#a855f7',
    badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  },
  {
    id: 'electromagnetism',
    title: 'หมวด 3: ไฟฟ้าและแม่เหล็ก',
    grade: 'ม.5-6',
    color: '#f59e0b',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  },
  {
    id: 'thermodynamics',
    title: 'หมวด 4: ความร้อน ของแข็ง ของไหล',
    grade: 'ม.6',
    color: '#10b981',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
  {
    id: 'modern_physics',
    title: 'หมวด 5: ฟิสิกส์แผนใหม่',
    grade: 'ม.6',
    color: '#f43f5e',
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  },
];

export const PHYSICS_MODULES: PhysicsModule[] = [
  // ============================================================================
  // หมวดที่ 1: กลศาสตร์ (Mechanics) - 6 บทเรียน
  // ============================================================================
  {
    id: 'mech-01-linear',
    code: 'ว31201-01',
    number: '1.1',
    title: 'การเคลื่อนที่แนวตรง (Linear Motion)',
    subtitle: 'ลู่ทดสอบรถยนต์ไฟฟ้าและจรวดความเร็วสูง 3D',
    gradeLevel: 'ม.4',
    category: 'mechanics',
    parameters: [
      { key: 'u', symbol: 'u', label: 'ความเร็วต้น', unit: 'm/s', min: 0, max: 40, step: 1, defaultValue: 20 },
      { key: 'a', symbol: 'a', label: 'ความเร่ง (+เร่ง / -หน่วง)', unit: 'm/s²', min: -10, max: 10, step: 0.5, defaultValue: -4 },
      { key: 'targetDist', symbol: 's_{target}', label: 'ระยะเส้นชัยเป้าหมาย', unit: 'm', min: 15, max: 90, step: 5, defaultValue: 50 },
    ],
    vectors: [
      { id: 'v', label: 'ความเร็ว', symbol: '\\vec{v}', color: '#22d3ee', defaultVisible: true },
      { id: 'a', label: 'ความเร่ง', symbol: '\\vec{a}', color: '#f43f5e', defaultVisible: true },
    ],
    graphTitle: 'กราฟการกระจัด s(t) และความเร็ว v(t)',
    graphXLabel: 'เวลา t (s)',
    graphTraces: [
      { key: 's', label: 'การกระจัด (s)', unit: 'm', color: '#22d3ee' },
      { key: 'v', label: 'ความเร็ว (v)', unit: 'm/s', color: '#f59e0b' },
    ],
    theorySummary:
      'การเคลื่อนที่แนวตรงด้วยความเร่งคงตัว อธิบายความสัมพันธ์ระหว่างการกระจัด (s), ความเร็วต้น (u), ความเร็วปลาย (v), ความเร่ง (a) และเวลา (t) โดยความชันของกราฟ s-t คือความเร็ว และพื้นที่ใต้กราฟ v-t คือการกระจัด',
    keyTakeaways: [
      'เมื่อความเร่งมีทิศตรงข้ามกับความเร็ว (a < 0) วัตถุจะเคลื่อนที่ช้าลงจนหยุดนิ่งชั่วคราวที่ v = 0',
      'ระยะเบรกจนหยุดนิ่งคำนวณได้จากสมการ v² = u² + 2as โดยแทน v = 0 จะได้ s_stop = -u² / (2a)',
    ],
    realWorldTitle: 'ระบบเบรกอัตโนมัติในรถยนต์ไฟฟ้า (AEB)',
    realWorldDescription:
      'เซ็นเซอร์ LiDAR บนรถยนต์ไฟฟ้าใช้สมการ v² = u² + 2as คำนวณระยะเบรกปลอดภัยแบบเรียลไทม์เพื่อหยุดรถก่อนชนสิ่งกีดขวาง',
    computeState: (params, time) => {
      const { u, a } = params;
      const t = time % 10;
      const stopTime = a < 0 && u > 0 ? Math.min(t, -u / a) : t;
      const v = a < 0 && t >= -u / a ? 0 : u + a * t;
      const s = u * stopTime + 0.5 * a * stopTime * stopTime;
      const stopDist = a < 0 ? -(u * u) / (2 * a) : u * 5 + 0.5 * a * 25;

      return {
        metrics: [
          { label: 'การกระจัดปัจจุบัน', symbol: 's', value: s.toFixed(1), unit: 'm', color: '#22d3ee' },
          { label: 'ความเร็วขณะนั้น', symbol: 'v', value: v.toFixed(1), unit: 'm/s', color: '#f59e0b' },
          { label: 'ระยะหยุดนิ่งคำนวณ', symbol: 's_{stop}', value: stopDist.toFixed(1), unit: 'm', color: '#10b981' },
        ],
        rawMetrics: { s, v, stopDist, t },
        equations: [
          {
            title: 'สมการการกระจัดตามเวลา',
            latexFormula: 's = ut + \\frac{1}{2}at^2',
            liveSubstitution: `s = (${u})(${stopTime.toFixed(1)}) + \\frac{1}{2}(${a})(${stopTime.toFixed(1)})^2`,
            resultText: `s = ${s.toFixed(2)}\\text{ m}`,
          },
          {
            title: 'สมการความเร็วและระยะหยุด',
            latexFormula: 'v^2 = u^2 + 2as \\implies s_{stop} = \\frac{-u^2}{2a}',
            liveSubstitution: a < 0 ? `s_{stop} = \\frac{-(${u})^2}{2(${a})}` : `v = ${u} + (${a})(${t.toFixed(1)})`,
            resultText: a < 0 ? `s_{stop} = ${stopDist.toFixed(2)}\\text{ m}` : `v = ${v.toFixed(2)}\\text{ m/s}`,
          },
        ],
        graphPoint: { s, v },
      };
    },
    mission: {
      id: 'm-1-1',
      title: 'ภารกิจ: เบรกหยุดหน้าเส้นชัย 50 เมตร',
      description: 'ตั้งความเร็วต้น u > 0 และปรับความหน่วง (a < 0) ให้รถเบรกหยุดนิ่งที่ระยะเส้นชัย 50.0 เมตรพอดี (±1.5 m)',
      hint: 'ใช้สูตร s = -u² / (2a) เช่น ถ้าตั้ง u = 20 m/s และ a = -4 m/s² จะได้ระยะหยุด 400 / 8 = 50 m',
      checkPassed: (params, raw) => {
        const passed = params.a < 0 && params.u > 0 && Math.abs(raw.stopDist - 50) <= 1.5;
        return {
          passed,
          progressText:
            params.a >= 0
              ? 'ต้องปรับความเร่ง a ให้ติดลบ (เบรกชะลอความเร็ว)'
              : `ระยะหยุดนิ่งของคุณ: ${raw.stopDist.toFixed(1)} m (เป้าหมาย: 50.0 m)`,
        };
      },
    },
    quiz: {
      question: 'หากรถยนต์แล่นด้วยความเร็วต้นเพิ่มขึ้นเป็น 2 เท่า ด้วยความหน่วงเบรกเท่าเดิม ระยะเบรกจนหยุดนิ่งจะเปลี่ยนไปอย่างไร?',
      options: ['เพิ่มขึ้นเป็น 2 เท่า', 'เพิ่มขึ้นเป็น 4 เท่า', 'เท่าเดิม', 'ลดลงครึ่งหนึ่ง'],
      correctIndex: 1,
      explanation: 'จาก v² = u² + 2as เมื่อ v = 0 จะได้ s ∝ u² ดังนั้นเมื่อความเร็วต้นเพิ่ม 2 เท่า ระยะเบรกจะเพิ่มเป็น 2² = 4 เท่า',
    },
  },

  {
    id: 'mech-02-newton',
    code: 'ว31201-02',
    number: '1.2',
    title: 'กฎของนิวตันและพื้นเอียง (Newton’s Laws)',
    subtitle: 'แผนภาพวัตถุอิสระ 3 มิติ (3D Free-Body Diagram) บนพื้นเอียง',
    gradeLevel: 'ม.4',
    category: 'mechanics',
    parameters: [
      { key: 'mass', symbol: 'm', label: 'มวลของกล่อง', unit: 'kg', min: 1, max: 20, step: 1, defaultValue: 5 },
      { key: 'angle', symbol: '\\theta', label: 'มุมพื้นเอียง', unit: '°', min: 5, max: 60, step: 1, defaultValue: 30 },
      { key: 'mu', symbol: '\\mu', label: 'สัมประสิทธิ์ความเสียดทาน', unit: '', min: 0, max: 1.0, step: 0.05, defaultValue: 0.3 },
      { key: 'g', symbol: 'g', label: 'ความเร่งโน้มถ่วง', unit: 'm/s²', min: 1.6, max: 15, step: 0.1, defaultValue: 9.8 },
    ],
    vectors: [
      { id: 'mg', label: 'น้ำหนัก (mg)', symbol: 'm\\vec{g}', color: '#f43f5e', defaultVisible: true },
      { id: 'N', label: 'แรงแนวฉาก (N)', symbol: '\\vec{N}', color: '#22d3ee', defaultVisible: true },
      { id: 'f', label: 'แรงเสียดทาน (f)', symbol: '\\vec{f}', color: '#f59e0b', defaultVisible: true },
    ],
    graphTitle: 'กราฟเปรียบเทียบแรงดึงลงพื้นเอียง vs แรงเสียดทาน',
    graphXLabel: 'เวลา t (s)',
    graphTraces: [
      { key: 'fDown', label: 'mg sin(θ)', unit: 'N', color: '#f43f5e' },
      { key: 'fFric', label: 'แรงเสียดทาน f', unit: 'N', color: '#f59e0b' },
      { key: 'acc', label: 'ความเร่งลัพธ์ a', unit: 'm/s²', color: '#10b981' },
    ],
    theorySummary:
      'บนพื้นเอียงทำมุม θ กับแนวระดับ น้ำหนัก mg จะแตกออกเป็นองค์ประกอบตั้งฉากกับพื้นเอียง (mg cos θ = N) และองค์ประกอบขนานพื้นเอียง (mg sin θ) ซึ่งดึงวัตถุให้ไถลลงต้านกับแรงเสียดทาน f = μN',
    keyTakeaways: [
      'วัตถุจะเริ่มไถลลงพื้นเอียงเมื่อ mg sin θ > μ_s mg cos θ หรือเมื่อ tan θ > μ_s',
      'ความเร่งในการไถลลง a = g(sin θ - μ cos θ) ไม่ขึ้นกับมวล m ของวัตถุ!',
    ],
    realWorldTitle: 'การออกแบบทางลาดวิศวกรรมและสายพานลำเลียง',
    realWorldDescription:
      'วิศวกรใช้ความสัมพันธ์ tan θ = μ ในการกำหนดความชันสูงสุดของถนนขึ้นภูเขาและสายพานลำเลียงสินค้าในโรงงานเพื่อไม่ให้กล่องลื่นไถล',
    computeState: (params) => {
      const { mass, angle, mu, g } = params;
      const rad = (angle * Math.PI) / 180;
      const N = mass * g * Math.cos(rad);
      const fDown = mass * g * Math.sin(rad);
      const fMax = mu * N;
      const fNet = Math.max(0, fDown - fMax);
      const fActual = fDown > fMax ? fMax : fDown;
      const acc = fNet / mass;
      const critAngle = (Math.atan(mu) * 180) / Math.PI;

      return {
        metrics: [
          { label: 'แรงดึงขนานพื้นเอียง', symbol: 'mg\\sin\\theta', value: fDown.toFixed(1), unit: 'N', color: '#f43f5e' },
          { label: 'แรงเสียดทานต้าน', symbol: 'f', value: fActual.toFixed(1), unit: 'N', color: '#f59e0b' },
          { label: 'ความเร่งไถลลง', symbol: 'a', value: acc.toFixed(2), unit: 'm/s²', color: '#10b981' },
        ],
        rawMetrics: { N, fDown, fMax, fNet, acc, critAngle },
        equations: [
          {
            title: 'กฎข้อที่ 2 ของนิวตันตามแนวพื้นเอียง',
            latexFormula: '\\sum F_x = mg\\sin\\theta - \\mu mg\\cos\\theta = ma',
            liveSubstitution: `\\sum F_x = ${fDown.toFixed(1)} - ${fMax.toFixed(1)} = ${fNet.toFixed(1)}\\text{ N}`,
            resultText: `a = ${acc.toFixed(2)}\\text{ m/s}^2`,
          },
          {
            title: 'มุมเอียงวิกฤตที่เริ่มไถล',
            latexFormula: '\\tan\\theta_c = \\mu \\implies \\theta_c = \\arctan(\\mu)',
            liveSubstitution: `\\theta_c = \\arctan(${mu.toFixed(2)})`,
            resultText: `\\theta_c = ${critAngle.toFixed(1)}^\\circ`,
          },
        ],
        graphPoint: { fDown, fFric: fActual, acc },
      };
    },
    mission: {
      id: 'm-1-2',
      title: 'ภารกิจ: หามุมเอียงวิกฤตเมื่อ μ = 0.50',
      description: 'ตั้งค่าสัมประสิทธิ์ความเสียดทาน μ = 0.50 แล้วปรับมุมพื้นเอียง θ ให้อยู่ที่จุดสมดุลวิกฤตพอดี (ความเร่ง a อยู่ระหว่าง 0.01 ถึง 0.35 m/s²)',
      hint: 'เมื่อ μ = 0.50 มุมวิกฤตคือ arctan(0.50) ≈ 26.6° ลองตั้งมุมที่ 27°',
      checkPassed: (params, raw) => {
        const passed = Math.abs(params.mu - 0.5) < 0.01 && raw.acc > 0 && raw.acc <= 0.4;
        return {
          passed,
          progressText: `μ = ${params.mu.toFixed(2)}, มุม θ = ${params.angle}° (มุมวิกฤต = ${raw.critAngle.toFixed(1)}°)`,
        };
      },
    },
    quiz: {
      question: 'หากเพิ่มมวลของกล่องบนพื้นเอียงจาก 5 kg เป็น 10 kg (โดยมุม θ และ μ เท่าเดิม) ความเร่งในการไถลลงจะเป็นอย่างไร?',
      options: ['เพิ่มขึ้น 2 เท่า', 'ลดลงครึ่งหนึ่ง', 'เท่าเดิมไม่เปลี่ยนแปลง', 'วัตถุจะหยุดนิ่งทันที'],
      correctIndex: 2,
      explanation: 'จาก a = g(sin θ - μ cos θ) มวล m ตัดกันทั้งสองข้างของสมการ ดังนั้นความเร่งบนพื้นเอียงจึงไม่ขึ้นกับมวล',
    },
  },

  {
    id: 'mech-03-torque',
    code: 'ว31201-03',
    number: '1.3',
    title: 'สมดุลกลและโมเมนต์ของแรง (Equilibrium & Torque)',
    subtitle: 'เครนและคานสมดุลโมเมนต์ 3 มิติ พร้อมเวกเตอร์ทอร์ก',
    gradeLevel: 'ม.4',
    category: 'mechanics',
    parameters: [
      { key: 'm1', symbol: 'm_1', label: 'มวลฝั่งซ้าย', unit: 'kg', min: 1, max: 20, step: 1, defaultValue: 10 },
      { key: 'r1', symbol: 'r_1', label: 'ระยะแขนโมเมนต์ซ้าย', unit: 'm', min: 1, max: 6, step: 0.5, defaultValue: 3 },
      { key: 'm2', symbol: 'm_2', label: 'มวลฝั่งขวา', unit: 'kg', min: 1, max: 20, step: 1, defaultValue: 6 },
      { key: 'r2', symbol: 'r_2', label: 'ระยะแขนโมเมนต์ขวา', unit: 'm', min: 1, max: 6, step: 0.5, defaultValue: 4 },
    ],
    vectors: [
      { id: 'F1', label: 'น้ำหนักฝั่งซ้าย', symbol: '\\vec{W}_1', color: '#22d3ee', defaultVisible: true },
      { id: 'F2', label: 'น้ำหนักฝั่งขวา', symbol: '\\vec{W}_2', color: '#f59e0b', defaultVisible: true },
      { id: 'tau', label: 'เวกเตอร์ทอร์กลัพธ์', symbol: '\\vec{\\tau}', color: '#a855f7', defaultVisible: true },
    ],
    graphTitle: 'เปรียบเทียบโมเมนต์ทวนเข็ม (M_ccw) และตามเข็มนาฬิกา (M_cw)',
    graphXLabel: 'เวลา t (s)',
    graphTraces: [
      { key: 'mCCW', label: 'M ทวนเข็ม', unit: 'N·m', color: '#22d3ee' },
      { key: 'mCW', label: 'M ตามเข็ม', unit: 'N·m', color: '#f59e0b' },
    ],
    theorySummary:
      'สมดุลต่อการหมุนเกิดขึ้นเมื่อผลรวมของโมเมนต์ของแรง (ทอร์ก τ = r × F) รอบจุดหมุนมีค่าเป็นศูนย์ หรือ ผลรวมโมเมนต์ทวนเข็มนาฬิกา เท่ากับ ผลรวมโมเมนต์ตามเข็มนาฬิกา',
    keyTakeaways: [
      'โมเมนต์ของแรง M = F × L เมื่อ L คือระยะตั้งฉากจากจุดหมุนไปยังแนวแรง',
      'แม้แรงจะมีขนาดไม่เท่ากัน แต่หากปรับระยะแขนของแรงให้เหมาะสม คานก็สามารถอยู่ในสมดุลต่อการหมุนได้',
    ],
    realWorldTitle: 'ทาวเวอร์เครนก่อสร้างอาคารสูง (Tower Crane)',
    realWorldDescription:
      'ทาวเวอร์เครนใช้ก้อนคอนกรีตถ่วงน้ำหนัก (Counterweight) ด้านหลังเสาเพื่อให้โมเมนต์ทวนเข็มสมดุลกับน้ำหนักวัสดุก่อสร้างที่ยกด้านหน้า',
    computeState: (params) => {
      const { m1, r1, m2, r2 } = params;
      const g = 9.8;
      const mCCW = m1 * g * r1;
      const mCW = m2 * g * r2;
      const netTorque = mCCW - mCW;
      const tiltAngle = Math.max(-25, Math.min(25, (netTorque / 150) * 15));

      return {
        metrics: [
          { label: 'โมเมนต์ทวนเข็ม (ซ้าย)', symbol: 'M_{ทวน}', value: mCCW.toFixed(1), unit: 'N·m', color: '#22d3ee' },
          { label: 'โมเมนต์ตามเข็ม (ขวา)', symbol: 'M_{ตาม}', value: mCW.toFixed(1), unit: 'N·m', color: '#f59e0b' },
          { label: 'ทอร์กลัพธ์', symbol: '\\sum\\tau', value: netTorque.toFixed(1), unit: 'N·m', color: Math.abs(netTorque) < 1 ? '#10b981' : '#f43f5e' },
        ],
        rawMetrics: { mCCW, mCW, netTorque, tiltAngle },
        equations: [
          {
            title: 'เงื่อนไขสมดุลต่อการหมุน',
            latexFormula: '\\sum M_{ทวน} = \\sum M_{ตาม} \\implies m_1 g r_1 = m_2 g r_2',
            liveSubstitution: `(${m1})(9.8)(${r1}) \\;\\text{vs}\\; (${m2})(9.8)(${r2})`,
            resultText: Math.abs(netTorque) < 0.5 ? 'สมดุลสมบูรณ์ (\\sum\\tau = 0)' : `ไม่สมดุล (\\Delta M = ${netTorque.toFixed(1)}\\text{ N\\cdot m})`,
          },
        ],
        graphPoint: { mCCW, mCW },
      };
    },
    mission: {
      id: 'm-1-3',
      title: 'ภารกิจ: ถ่วงดุลเครนเมื่อมวลซ้าย 12 kg ที่ระยะ 3.0 m',
      description: 'ตั้งมวลซ้าย m₁ = 12 kg ที่ระยะ r₁ = 3.0 m แล้วปรับมวลขวา m₂ และระยะ r₂ (โดยที่ m₂ ≠ 12 kg) ให้คานสมดุลแนวราบพอดี!',
      hint: 'ต้องทำให้ m₂ × r₂ = 12 × 3 = 36 เช่น ตั้ง m₂ = 9 kg และ r₂ = 4.0 m หรือ m₂ = 8 kg และ r₂ = 4.5 m',
      checkPassed: (params, raw) => {
        const passed = params.m1 === 12 && params.r1 === 3 && params.m2 !== 12 && Math.abs(raw.netTorque) < 0.5;
        return {
          passed,
          progressText: `m₁·r₁ = ${(params.m1 * params.r1).toFixed(1)} | m₂·r₂ = ${(params.m2 * params.r2).toFixed(1)}`,
        };
      },
    },
    quiz: {
      question: 'ถ้าต้องการใช้แรงน้อยที่สุดในการขันน็อตที่แน่นมาก ควรทำอย่างไรตามหลักโมเมนต์ของแรง?',
      options: ['ใช้ประแจด้ามสั้นลง', 'ใช้ประแจด้ามยาวขึ้นและออกแรงตั้งฉากกับด้าม', 'ออกแรงทำมุม 30 องศากับด้ามประแจ', 'ออกแรงใกล้หัวน็อตมากที่สุด'],
      correctIndex: 1,
      explanation: 'จาก M = F · r sin θ การเพิ่มความยาวแขน r และออกแรงตั้งฉาก (sin 90° = 1) จะทำให้ได้โมเมนต์สูงสุดโดยใช้แรง F น้อยที่สุด',
    },
  },

  {
    id: 'mech-04-energy',
    code: 'ว31202-01',
    number: '1.4',
    title: 'งานและกฎการอนุรักษ์พลังงาน (Work & Energy)',
    subtitle: 'รางรถไฟเหาะตีลังกา 3 มิติ (3D Roller Coaster Loop)',
    gradeLevel: 'ม.4',
    category: 'mechanics',
    parameters: [
      { key: 'h0', symbol: 'h_0', label: 'ความสูงจุดปล่อยรถไฟ', unit: 'm', min: 10, max: 60, step: 1, defaultValue: 35 },
      { key: 'loopR', symbol: 'R', label: 'รัศมีวงลูปตีลังกา', unit: 'm', min: 5, max: 20, step: 1, defaultValue: 12 },
      { key: 'mass', symbol: 'm', label: 'มวลรถไฟเหาะ', unit: 'kg', min: 100, max: 1000, step: 50, defaultValue: 500 },
    ],
    vectors: [
      { id: 'v', label: 'ความเร็วรถไฟ', symbol: '\\vec{v}', color: '#22d3ee', defaultVisible: true },
      { id: 'Fc', label: 'แรงสู่ศูนย์กลาง', symbol: '\\vec{F}_c', color: '#f43f5e', defaultVisible: true },
    ],
    graphTitle: 'กราฟพลังงานศักย์โน้มถ่วง (Ep), พลังงานจลน์ (Ek) และพลังงานรวม (E)',
    graphXLabel: 'เวลา t (s)',
    graphTraces: [
      { key: 'Ep', label: 'พลังงานศักย์ Ep', unit: 'kJ', color: '#a855f7' },
      { key: 'Ek', label: 'พลังงานจลน์ Ek', unit: 'kJ', color: '#22d3ee' },
      { key: 'Etot', label: 'พลังงานกลรวม E', unit: 'kJ', color: '#10b981' },
    ],
    theorySummary:
      'เมื่อไม่มีแรงเสียดทาน พลังงานกลรวมของระบบจะมีค่าคงตัวเสมอ (E₁ = E₂ หรือ Ep₁ + Ek₁ = Ep₂ + Ek₂) โดยการที่รถไฟเหาะจะครบรอบลูปรัศมี R ได้โดยไม่ตกราง ความสูงจุดปล่อยต้องมีค่าอย่างน้อย h₀ ≥ 2.5R',
    keyTakeaways: [
      'พลังงานศักย์โน้มถ่วง Ep = mgh เปลี่ยนรูปเป็นพลังงานจลน์ Ek = ½mv² ขณะรถไฟไหลลงเนิน',
      'ณ จุดสูงสุดของลูปตีลังกา (ความสูง 2R) ต้องมีความเร็วขั้นต่ำ v_top = √(gR) จึงต้องปล่อยจากความสูง h_min = 2.5R',
    ],
    realWorldTitle: 'วิศวกรรมเครื่องเล่นรถไฟเหาะตีลังกา',
    realWorldDescription:
      'ผู้ออกแบบสวนสนุกคำนวณความสูงเนินแรก (Lift Hill) ให้สูงกว่า 2.5 เท่าของรัศมีลูปเสมอ พร้อมเผื่อพลังงานที่สูญเสียไปกับความฝืดของราง',
    computeState: (params, time) => {
      const { h0, loopR, mass } = params;
      const g = 9.8;
      const phase = (time * 1.4) % (Math.PI * 2);
      const currentH = Math.max(0, Math.min(h0, loopR * (1 - Math.cos(phase))));
      const Etot = (mass * g * h0) / 1000;
      const Ep = (mass * g * currentH) / 1000;
      const Ek = Math.max(0, Etot - Ep);
      const vCurrent = Math.sqrt(Math.max(0, 2 * g * (h0 - currentH)));
      const minHeightNeeded = 2.5 * loopR;
      const loopSafe = h0 >= minHeightNeeded ? 1 : 0;

      return {
        metrics: [
          { label: 'พลังงานกลรวม', symbol: 'E_{total}', value: Etot.toFixed(1), unit: 'kJ', color: '#10b981' },
          { label: 'ความเร็วขณะนั้น', symbol: 'v', value: vCurrent.toFixed(1), unit: 'm/s', color: '#22d3ee' },
          { label: 'ความสูงขั้นต่ำครบลูป', symbol: 'h_{min}', value: minHeightNeeded.toFixed(1), unit: 'm', color: loopSafe ? '#10b981' : '#f43f5e' },
        ],
        rawMetrics: { Etot, Ep, Ek, vCurrent, minHeightNeeded, loopSafe },
        equations: [
          {
            title: 'กฎการอนุรักษ์พลังงานกล',
            latexFormula: 'mgh_0 = mgh + \\frac{1}{2}mv^2',
            liveSubstitution: `${Etot.toFixed(1)}\\text{ kJ} = ${Ep.toFixed(1)}\\text{ kJ} + ${Ek.toFixed(1)}\\text{ kJ}`,
            resultText: `v = \\sqrt{2g(h_0 - h)} = ${vCurrent.toFixed(1)}\\text{ m/s}`,
          },
          {
            title: 'เงื่อนไขครบลูปตีลังกาโดยไม่ตกราง',
            latexFormula: 'h_{min} = \\frac{5}{2}R = 2.5R',
            liveSubstitution: `h_{min} = 2.5 \\times ${loopR} = ${minHeightNeeded.toFixed(1)}\\text{ m}`,
            resultText: loopSafe ? 'ผ่านลูปได้อย่างปลอดภัย!' : 'ความสูงไม่พอ รถไฟตกรางที่ยอดลูป!',
          },
        ],
        graphPoint: { Ep, Ek, Etot },
      };
    },
    mission: {
      id: 'm-1-4',
      title: 'ภารกิจ: ออกแบบความสูงขั้นต่ำสำหรับลูปรัศมี R = 16 m',
      description: 'ตั้งรัศมีลูปตีลังกา R = 16 m แล้วปรับความสูงจุดปล่อย h₀ ให้เท่ากับความสูงขั้นต่ำพอดีที่จะครบลูปได้โดยไม่สิ้นเปลืองโครงสร้าง',
      hint: 'ใช้สูตร h_min = 2.5 × R = 2.5 × 16 = 40 m',
      checkPassed: (params) => {
        const passed = params.loopR === 16 && params.h0 === 40;
        return {
          passed,
          progressText: `R = ${params.loopR} m, h₀ = ${params.h0} m (เป้าหมาย h_min = 2.5R = 40 m)`,
        };
      },
    },
    quiz: {
      question: 'รถไฟเหาะที่ถูกปล่อยจากจุดหยุดนิ่งที่ความสูง h₀ เพื่อเข้าสู่ลูปวงกลมรัศมี R ต้องปล่อยที่ความสูงอย่างน้อยเท่าใดจึงจะไม่หลุดจากรางที่จุดสูงสุดของลูป?',
      options: ['h₀ = 2.0R', 'h₀ = 2.5R', 'h₀ = 3.0R', 'h₀ = 1.5R'],
      correctIndex: 1,
      explanation: 'ที่ยอดลูปสูง 2R ต้องมีแรงสู่ศูนย์กลางขั้นต่ำ mv²/R = mg หรือ Ek = ½mgR รวมกับ Ep = 2mgR จึงต้องมีพลังงานต้น 2.5mgR หรือ h₀ = 2.5R',
    },
  },

  {
    id: 'mech-05-momentum',
    code: 'ว31202-02',
    number: '1.5',
    title: 'โมเมนตัมและการชน (Momentum & Collisions)',
    subtitle: 'การชนของทรงกลม 3 มิติ และการอนุรักษ์โมเมนตัม',
    gradeLevel: 'ม.4',
    category: 'mechanics',
    parameters: [
      { key: 'm1', symbol: 'm_1', label: 'มวลลูกที่ 1 (สีฟ้า)', unit: 'kg', min: 1, max: 10, step: 1, defaultValue: 4 },
      { key: 'u1', symbol: 'u_1', label: 'ความเร็วต้นลูกที่ 1', unit: 'm/s', min: 2, max: 20, step: 1, defaultValue: 10 },
      { key: 'm2', symbol: 'm_2', label: 'มวลลูกที่ 2 (สีส้ม)', unit: 'kg', min: 1, max: 10, step: 1, defaultValue: 4 },
      { key: 'e', symbol: 'e', label: 'สัมประสิทธิ์ความยืดหยุ่น (1=ยืดหยุ่น)', unit: '', min: 0, max: 1, step: 0.1, defaultValue: 1.0 },
    ],
    vectors: [
      { id: 'p1', label: 'โมเมนตัมลูกที่ 1', symbol: '\\vec{p}_1', color: '#22d3ee', defaultVisible: true },
      { id: 'p2', label: 'โมเมนตัมลูกที่ 2', symbol: '\\vec{p}_2', color: '#f59e0b', defaultVisible: true },
    ],
    graphTitle: 'กราฟโมเมนตัมรวม (p_total) ก่อนและหลังการชน',
    graphXLabel: 'เวลา t (s)',
    graphTraces: [
      { key: 'p1', label: 'โมเมนตัม p₁', unit: 'kg·m/s', color: '#22d3ee' },
      { key: 'p2', label: 'โมเมนตัม p₂', unit: 'kg·m/s', color: '#f59e0b' },
      { key: 'pTot', label: 'โมเมนตัมรวม', unit: 'kg·m/s', color: '#10b981' },
    ],
    theorySummary:
      'เมื่อไม่มีแรงภายนอกมากระทำต่อระบบ ผลรวมโมเมนตัมของระบบก่อนชนจะเท่ากับผลรวมโมเมนตัมของระบบหลังชนเสมอ (∑p_ก่อน = ∑p_หลัง) โดยในการชนแบบยืดหยุ่นสมบูรณ์ (e = 1) พลังงานจลน์รวมของระบบจะคงตัวด้วย',
    keyTakeaways: [
      'หากมวลเท่ากัน (m₁ = m₂) และชนแบบยืดหยุ่นสมบูรณ์ (e = 1) ลูกที่ 1 จะหยุดนิ่งและถ่ายทอดความเร็วทั้งหมดให้ลูกที่ 2',
      'หากเป็นการชนแบบไม่ยืดหยุ่นสมบูรณ์ (e = 0) วัตถุทั้งสองจะติดกันไปหลังชนด้วยความเร็ว v = m₁u₁ / (m₁ + m₂)',
    ],
    realWorldTitle: 'ลูกตุ้มของนิวตัน (Newton’s Cradle) และการเล่นสนุกเกอร์',
    realWorldDescription:
      'ในการแทงลูกสนุกเกอร์ที่มีมวลเท่ากันแบบตรงศูนย์ ลูกขาวจะหยุดนิ่งอยู่กับที่และส่งมอบโมเมนตัมทั้งหมดให้ลูกสีวิ่งลงหลุม',
    computeState: (params, time) => {
      const { m1, u1, m2, e } = params;
      const u2 = 0;
      const v1 = ((m1 - e * m2) * u1 + (1 + e) * m2 * u2) / (m1 + m2);
      const v2 = ((m2 - e * m1) * u2 + (1 + e) * m1 * u1) / (m1 + m2);
      const collided = (time % 4) > 2;
      const p1 = m1 * (collided ? v1 : u1);
      const p2 = m2 * (collided ? v2 : u2);
      const pTot = m1 * u1;

      return {
        metrics: [
          { label: 'ความเร็วหลังชนลูกที่ 1', symbol: 'v_1', value: v1.toFixed(2), unit: 'm/s', color: '#22d3ee' },
          { label: 'ความเร็วหลังชนลูกที่ 2', symbol: 'v_2', value: v2.toFixed(2), unit: 'm/s', color: '#f59e0b' },
          { label: 'โมเมนตัมรวมของระบบ', symbol: '\\sum p', value: pTot.toFixed(1), unit: 'kg·m/s', color: '#10b981' },
        ],
        rawMetrics: { v1, v2, p1, p2, pTot },
        equations: [
          {
            title: 'กฎการอนุรักษ์โมเมนตัม',
            latexFormula: 'm_1 u_1 + m_2 u_2 = m_1 v_1 + m_2 v_2',
            liveSubstitution: `(${m1})(${u1}) + 0 = (${m1})(${v1.toFixed(1)}) + (${m2})(${v2.toFixed(1)})`,
            resultText: `\\sum p = ${pTot.toFixed(1)}\\text{ kg\\cdot m/s คงตัว}`,
          },
        ],
        graphPoint: { p1, p2, pTot },
      };
    },
    mission: {
      id: 'm-1-5',
      title: 'ภารกิจ: ชนแล้วติดกันไปด้วยความเร็ว 4.0 m/s',
      description: 'ปรับให้เป็นการชนแบบไม่ยืดหยุ่นสมบูรณ์ (ติดกันไปหลังชน e = 0) และปรับมวลและอัตราเร็วให้หลังชนทั้งคู่เคลื่อนที่ไปด้วยความเร็ว v₁ = v₂ = 4.0 m/s พอดี',
      hint: 'ตั้ง e = 0 แล้วใช้สูตร v = m₁u₁ / (m₁ + m₂) = 4 เช่น ตั้ง m₁ = 4 kg, m₂ = 4 kg, u₁ = 8 m/s',
      checkPassed: (params, raw) => {
        const passed = params.e === 0 && Math.abs(raw.v2 - 4.0) < 0.05;
        return {
          passed,
          progressText: `e = ${params.e.toFixed(1)}, ความเร็วหลังชน v₂ = ${raw.v2.toFixed(2)} m/s (เป้าหมาย: 4.00 m/s)`,
        };
      },
    },
    quiz: {
      question: 'ในการชนทุกประเภทที่ไม่มีแรงภายนอกมากระทำ ปริมาณใดต่อไปนี้มีค่าคงตัวเสมอ?',
      options: ['พลังงานจลน์รวม', 'โมเมนตัมรวมของระบบ', 'อัตราเร็วของวัตถุแต่ละก้อน', 'พลังงานความร้อน'],
      correctIndex: 1,
      explanation: 'กฎการอนุรักษ์โมเมนตัมเป็นจริงเสมอทั้งในการชนแบบยืดหยุ่นและไม่ยืดหยุ่น ในขณะที่พลังงานจลน์จะคงตัวเฉพาะการชนแบบยืดหยุ่นสมบูรณ์เท่านั้น',
    },
  },

  {
    id: 'mech-06-projectile',
    code: 'ว31202-03',
    number: '1.6',
    title: 'การเคลื่อนที่แบบโปรเจกไทล์ 3 มิติ (3D Projectile)',
    subtitle: 'ปืนใหญ่จำลองวิถีโค้งพาราโบลา 3 มิติ และองค์ประกอบความเร็ว',
    gradeLevel: 'ม.4',
    category: 'mechanics',
    parameters: [
      { key: 'u', symbol: 'u', label: 'ความเร็วต้นลูกปืนใหญ่', unit: 'm/s', min: 10, max: 40, step: 1, defaultValue: 25 },
      { key: 'theta', symbol: '\\theta', label: 'มุมยิงเงย', unit: '°', min: 15, max: 80, step: 1, defaultValue: 45 },
      { key: 'g', symbol: 'g', label: 'ความเร่งโน้มถ่วง (โลก=9.8)', unit: 'm/s²', min: 1.6, max: 15, step: 0.1, defaultValue: 9.8 },
    ],
    vectors: [
      { id: 'vx', label: 'ความเร็วแนวราบ (vx)', symbol: '\\vec{v}_x', color: '#22d3ee', defaultVisible: true },
      { id: 'vy', label: 'ความเร็วแนวดิ่ง (vy)', symbol: '\\vec{v}_y', color: '#f59e0b', defaultVisible: true },
      { id: 'v', label: 'ความเร็วลัพธ์ (v)', symbol: '\\vec{v}', color: '#10b981', defaultVisible: true },
    ],
    graphTitle: 'กราฟตำแหน่งความสูง y(t) และความเร็วแนวดิ่ง vy(t)',
    graphXLabel: 'เวลา t (s)',
    graphTraces: [
      { key: 'y', label: 'ความสูง y', unit: 'm', color: '#22d3ee' },
      { key: 'vy', label: 'ความเร็วแนวดิ่ง vy', unit: 'm/s', color: '#f59e0b' },
    ],
    theorySummary:
      'การเคลื่อนที่แบบโปรเจกไทล์เป็นการเคลื่อนที่ 2 มิติที่ประกอบไปด้วย แนวราบซึ่งมีความเร็วคงตัว (vx = u cos θ) และแนวดิ่งซึ่งเคลื่อนที่ภายใต้ความเร่งโน้มถ่วงคงตัว g ทำให้เส้นทางการเคลื่อนที่เป็นรูปพาราโบลา',
    keyTakeaways: [
      'ณ จุดสูงสุดของวิถีโค้ง ความเร็วแนวดิ่ง vy = 0 แต่ความเร็วแนวราบ vx = u cos θ ยังคงเท่าเดิม',
      'ภายใต้ความเร็วต้นเท่ากัน มุมยิง 45° ให้ระยะตกไกลสุดในแนวราบ และมุมยิงที่รวมกันได้ 90° (เช่น 30° กับ 60°) จะตกไกลเท่ากัน!',
    ],
    realWorldTitle: 'วิถีลูกบาสเกตบอลและการคำนวณวิถีจรวด',
    realWorldDescription:
      'นักบาสเกตบอลและระบบคำนวณวิถีโดรนกู้ภัยใช้สมการโปรเจกไทล์ในการคำนวณมุมและความเร็วต้นเพื่อให้พัสดุลงตรงจุดหมาย',
    computeState: (params, time) => {
      const { u, theta, g } = params;
      const rad = (theta * Math.PI) / 180;
      const ux = u * Math.cos(rad);
      const uy = u * Math.sin(rad);
      const tTotal = (2 * uy) / g;
      const t = time % (tTotal + 0.5);
      const activeT = Math.min(t, tTotal);
      const x = ux * activeT;
      const y = Math.max(0, uy * activeT - 0.5 * g * activeT * activeT);
      const vy = activeT >= tTotal ? 0 : uy - g * activeT;
      const hMax = (uy * uy) / (2 * g);
      const range = (u * u * Math.sin(2 * rad)) / g;

      return {
        metrics: [
          { label: 'ระยะตกไกลสุด (Range)', symbol: 'R', value: range.toFixed(1), unit: 'm', color: '#22d3ee' },
          { label: 'จุดสูงสุด (Max Height)', symbol: 'H_{max}', value: hMax.toFixed(1), unit: 'm', color: '#a855f7' },
          { label: 'เวลาลอยตัวในอากาศ', symbol: 'T', value: tTotal.toFixed(2), unit: 's', color: '#f59e0b' },
        ],
        rawMetrics: { x, y, ux, vy, hMax, range, tTotal },
        equations: [
          {
            title: 'สมการระยะตกไกลสุดในแนวระดับ',
            latexFormula: 'R = \\frac{u^2 \\sin(2\\theta)}{g}',
            liveSubstitution: `R = \\frac{(${u})^2 \\sin(${2 * theta}^\\circ)}{${g}}`,
            resultText: `R = ${range.toFixed(2)}\\text{ m}`,
          },
          {
            title: 'สมการความสูงจุดสูงสุด',
            latexFormula: 'H_{max} = \\frac{u^2 \\sin^2\\theta}{2g}',
            liveSubstitution: `H_{max} = \\frac{(${u})^2 \\sin^2(${theta}^\\circ)}{2(${g})}`,
            resultText: `H_{max} = ${hMax.toFixed(2)}\\text{ m}`,
          },
        ],
        graphPoint: { y, vy },
      };
    },
    mission: {
      id: 'm-1-6',
      title: 'ภารกิจ: ยิงปืนใหญ่เข้าเป้าหมายที่ระยะ 55.0 เมตร บนโลก',
      description: 'ตั้งค่าความเร่งโน้มถ่วงโลก g = 9.8 m/s² แล้วปรับความเร็วต้น u และมุมยิง θ ให้ลูกปืนใหญ่ตกลงที่เป้าหมายระยะ R = 55.0 m (±1.2 m)',
      hint: 'ลองตั้ง u = 25 m/s แล้วปรับมุมยิง θ ไปที่ 30° หรือ 60° จะได้ระยะ R ≈ 55.2 m!',
      checkPassed: (params, raw) => {
        const passed = Math.abs(params.g - 9.8) < 0.1 && Math.abs(raw.range - 55.0) <= 1.2;
        return {
          passed,
          progressText: `ระยะตกปัจจุบัน R = ${raw.range.toFixed(1)} m (เป้าหมาย: 55.0 ± 1.2 m)`,
        };
      },
    },
    quiz: {
      question: 'หากยิงโปรเจกไทล์ด้วยความเร็วต้นเท่ากันที่มุม 30° และ 60° ปริมาณใดของทั้งสองกรณีที่มีค่าเท่ากัน?',
      options: ['ความสูงจุดสูงสุด (H_max)', 'เวลาที่อยู่ในอากาศ (T)', 'ระยะตกไกลสุดในแนวระดับ (R)', 'ความเร็วแนวดิ่งเริ่มต้น (u_y)'],
      correctIndex: 2,
      explanation: 'เนื่องจาก sin(2×30°) = sin(60°) เท่ากับ sin(2×60°) = sin(120°) ดังนั้นมุมยิงที่รวมกันได้ 90° จะให้ระยะตกไกลสุด R เท่ากันเสมอ',
    },
  },

  // ============================================================================
  // หมวดที่ 2: คลื่น เสียง และแสง (Waves, Sound & Optics) - 4 บทเรียน
  // ============================================================================
  {
    id: 'wave-01-ripple',
    code: 'ว32201-01',
    number: '2.1',
    title: 'คลื่นกลและการแทรกสอดในถังคลื่น 3 มิติ (3D Ripple Tank)',
    subtitle: 'ถังคลื่นน้ำ 3 มิติ แสดงแนวบัพ (Node) และปฏิบัพ (Antinode)',
    gradeLevel: 'ม.5',
    category: 'waves',
    parameters: [
      { key: 'freq', symbol: 'f', label: 'ความถี่แหล่งกำเนิดคลื่น', unit: 'Hz', min: 1, max: 10, step: 0.5, defaultValue: 4 },
      { key: 'dist', symbol: 'd', label: 'ระยะห่างแหล่งกำเนิดอาพันธ์', unit: 'cm', min: 2, max: 20, step: 0.5, defaultValue: 8 },
      { key: 'speed', symbol: 'v', label: 'อัตราเร็วคลื่นผิวน้ำ', unit: 'cm/s', min: 4, max: 24, step: 1, defaultValue: 12 },
    ],
    vectors: [
      { id: 'vWave', label: 'ทิศทางหน้าคลื่น', symbol: '\\vec{v}', color: '#22d3ee', defaultVisible: true },
      { id: 'antinode', label: 'แนวปฏิบัพ (A)', symbol: 'A_n', color: '#f59e0b', defaultVisible: true },
    ],
    graphTitle: 'กราฟการกระจัดของผิวน้ำจากแหล่งกำเนิด S₁, S₂ และคลื่นรวม',
    graphXLabel: 'เวลา t (s)',
    graphTraces: [
      { key: 'y1', label: 'คลื่น S₁', unit: 'cm', color: '#22d3ee' },
      { key: 'yTotal', label: 'คลื่นแทรกสอดรวม', unit: 'cm', color: '#a855f7' },
    ],
    theorySummary:
      'เมื่อคลื่นต่อเนื่องจากแหล่งกำเนิดอาพันธ์ 2 แหล่ง (S₁, S₂) เคลื่อนที่มาพบกัน จะเกิดการซ้อนทับกันเป็นแนวปฏิบัพ (A: เสริมกัน น้ำกระเพื่อมแรงสุด) และแนวบัพ (N: หักล้างกัน น้ำนิ่งสนิท) สลับกันไป',
    keyTakeaways: [
      'ความยาวคลื่นคำนวณจาก λ = v / f',
      'แนวปฏิบัพเกิดขึ้นเมื่อผลต่างระยะทาง |S₁P - S₂P| = nλ และแนวบัพเกิดขึ้นเมื่อ |S₁P - S₂P| = (n - ½)λ',
    ],
    realWorldTitle: 'ระบบตัดเสียงรบกวน (Active Noise Cancelling) และเขื่อนกันคลื่น',
    realWorldDescription:
      'หูฟังตัดเสียงรบกวนสร้างคลื่นที่มีเฟสตรงข้าม 180° เพื่อให้เกิดการแทรกสอดแบบหักล้าง (Node) ที่แก้วหูของผู้ฟัง',
    computeState: (params, time) => {
      const { freq, dist, speed } = params;
      const lambda = speed / freq;
      const maxAntinodeOrder = Math.floor(dist / lambda);
      const totalAntinodes = 2 * maxAntinodeOrder + 1;
      const y1 = Math.sin(2 * Math.PI * freq * time);
      const yTotal = 2 * y1;

      return {
        metrics: [
          { label: 'ความยาวคลื่นผิวน้ำ', symbol: '\\lambda', value: lambda.toFixed(2), unit: 'cm', color: '#22d3ee' },
          { label: 'อัตราส่วน d / λ', symbol: 'd/\\lambda', value: (dist / lambda).toFixed(2), unit: 'เท่า', color: '#a855f7' },
          { label: 'จำนวนแนวปฏิบัพทั้งหมด', symbol: 'N_A', value: totalAntinodes.toString(), unit: 'แนว', color: '#f59e0b' },
        ],
        rawMetrics: { lambda, maxAntinodeOrder, totalAntinodes, y1, yTotal },
        equations: [
          {
            title: 'สมการอัตราเร็วและความยาวคลื่น',
            latexFormula: 'v = f\\lambda \\implies \\lambda = \\frac{v}{f}',
            liveSubstitution: `\\lambda = \\frac{${speed}}{${freq}}`,
            resultText: `\\lambda = ${lambda.toFixed(2)}\\text{ cm}`,
          },
          {
            title: 'สมการการแทรกสอดแบบเสริม (แนวปฏิบัพ)',
            latexFormula: '|S_1P - S_2P| = d\\sin\\theta = n\\lambda',
            liveSubstitution: `n_{max} = \\lfloor \\frac{d}{\\lambda} \\rfloor = \\lfloor \\frac{${dist}}{${lambda.toFixed(2)}} \\rfloor = ${maxAntinodeOrder}`,
            resultText: `\\text{เกิดแนวปฏิบัพรวม } 2(${maxAntinodeOrder}) + 1 = ${totalAntinodes}\\text{ แนว}`,
          },
        ],
        graphPoint: { y1, yTotal },
      };
    },
    mission: {
      id: 'm-2-1',
      title: 'ภารกิจ: สร้างแนวปฏิบัพทั้งหมด 7 แนวในถังคลื่น',
      description: 'ปรับความถี่ f และระยะห่างแหล่งกำเนิด d ให้เกิดความยาวคลื่น λ = 3.0 cm และมีแนวปฏิบัพทั้งหมด 7 แนวพอดี (n_max = 3)',
      hint: 'ตั้งอัตราเร็ว v = 12 cm/s และความถี่ f = 4 Hz จะได้ λ = 3.0 cm จากนั้นตั้งระยะห่าง d ให้อยู่ระหว่าง 9.0 ถึง 11.5 cm',
      checkPassed: (_params, raw) => {
        const passed = Math.abs(raw.lambda - 3.0) < 0.05 && raw.totalAntinodes === 7;
        return {
          passed,
          progressText: `λ = ${raw.lambda.toFixed(2)} cm, จำนวนแนวปฏิบัพ = ${raw.totalAntinodes} แนว (เป้าหมาย: λ=3 cm, 7 แนว)`,
        };
      },
    },
    quiz: {
      question: 'หากเพิ่มความถี่ของแหล่งกำเนิดคลื่นอาพันธ์ทั้งสองให้สูงขึ้น โดยระยะห่างระหว่างแหล่งกำเนิดเท่าเดิม ลวดลายการแทรกสอดในถังคลื่นจะเปลี่ยนไปอย่างไร?',
      options: ['ความยาวคลื่นเพิ่มขึ้น และจำนวนแนวบัพน้อยลง', 'ความยาวคลื่นสั้นลง และแนวบัพ-ปฏิบัพเบียดชิดกันมากขึ้น (จำนวนแนวมากขึ้น)', 'ไม่เปลี่ยนแปลง', 'แนวบัพหายไปทั้งหมด'],
      correctIndex: 1,
      explanation: 'เมื่อความถี่ f เพิ่มขึ้น ความยาวคลื่น λ = v/f จะลดลง ทำให้ d/λ มีค่ามากขึ้น จึงเกิดแนวบัพและปฏิบัพจำนวนมากขึ้นและเบียดชิดกันมากขึ้น',
    },
  },

  {
    id: 'wave-02-sound',
    code: 'ว32201-02',
    number: '2.2',
    title: 'เสียง การสั่นพ้อง และดอปเพลอร์ (Sound & Resonance)',
    subtitle: 'ท่อเรโซแนนซ์อนุภาคอากาศ 3 มิติ และคลื่นนิ่งเสียง',
    gradeLevel: 'ม.5',
    category: 'waves',
    parameters: [
      { key: 'harmonic', symbol: 'n', label: 'ลำดับฮาร์มอนิก (ท่อปลายเปิด 2 ด้าน)', unit: '', min: 1, max: 5, step: 1, defaultValue: 2 },
      { key: 'tubeL', symbol: 'L', label: 'ความยาวท่อเรโซแนนซ์', unit: 'm', min: 0.5, max: 3.0, step: 0.1, defaultValue: 1.7 },
      { key: 'temp', symbol: 'T_c', label: 'อุณหภูมิอากาศ', unit: '°C', min: 0, max: 45, step: 5, defaultValue: 25 },
    ],
    vectors: [
      { id: 'pWave', label: 'แอมพลิจูดการสั่นอนุภาค', symbol: '\\vec{s}', color: '#22d3ee', defaultVisible: true },
    ],
    graphTitle: 'กราฟคลื่นนิ่งการกระจัดของโมเลกุลอากาศในท่อเรโซแนนซ์',
    graphXLabel: 'เวลา t (s)',
    graphTraces: [
      { key: 'amp', label: 'แอมพลิจูดปฏิบัพ', unit: 'mm', color: '#a855f7' },
    ],
    theorySummary:
      'การสั่นพ้องของเสียงในท่อเกิดขึ้นเมื่อความถี่ของเสียงทำให้เกิดคลื่นนิ่งในท่อ โดยปากท่อเปิดจะเป็นตำแหน่งปฏิบัพของการกระจัด (Antinode) เสมอ สำหรับท่อปลายเปิดทั้งสองด้าน ความถี่สั่นพ้องคือ f_n = n(v / 2L)',
    keyTakeaways: [
      'อัตราเร็วเสียงในอากาศแปรผันตามอุณหภูมิ: v ≈ 331 + 0.6T_c (m/s)',
      'ในท่อปลายเปิด 2 ด้าน ความยาวท่อ L = n(λ/2) จึงเกิดได้ทุกฮาร์มอนิก (n = 1, 2, 3, ...)',
    ],
    realWorldTitle: 'การออกแบบเครื่องดนตรีประเภทเป่า (ขลุ่ย, ฟลูต, ออร์แกน)',
    realWorldDescription:
      'การเปิด-ปิดรูบนเลาขลุ่ยคือการเปลี่ยนความยาวประสิทธิผล L ของท่อเรโซแนนซ์เพื่อให้เกิดความถี่เสียงตัวโน้ตที่ต่างกัน',
    computeState: (params, time) => {
      const { harmonic, tubeL, temp } = params;
      const vSound = 331 + 0.6 * temp;
      const lambda = (2 * tubeL) / harmonic;
      const freq = vSound / lambda;
      const amp = Math.cos(2 * Math.PI * 2 * time) * 10;

      return {
        metrics: [
          { label: 'อัตราเร็วเสียงในอากาศ', symbol: 'v', value: vSound.toFixed(1), unit: 'm/s', color: '#22d3ee' },
          { label: 'ความยาวคลื่นสั่นพ้อง', symbol: '\\lambda_n', value: lambda.toFixed(2), unit: 'm', color: '#a855f7' },
          { label: 'ความถี่สั่นพ้อง', symbol: 'f_n', value: freq.toFixed(1), unit: 'Hz', color: '#f59e0b' },
        ],
        rawMetrics: { vSound, lambda, freq, amp },
        equations: [
          {
            title: 'อัตราเร็วเสียงตามอุณหภูมิ',
            latexFormula: 'v = 331 + 0.6T_c',
            liveSubstitution: `v = 331 + 0.6(${temp})`,
            resultText: `v = ${vSound.toFixed(1)}\\text{ m/s}`,
          },
          {
            title: 'ความถี่สั่นพ้องในท่อปลายเปิด 2 ด้าน',
            latexFormula: 'f_n = n\\left(\\frac{v}{2L}\\right)',
            liveSubstitution: `f_${harmonic} = ${harmonic}\\left(\\frac{${vSound.toFixed(1)}}{2 \\times ${tubeL}}\\right)`,
            resultText: `f_${harmonic} = ${freq.toFixed(1)}\\text{ Hz}`,
          },
        ],
        graphPoint: { amp },
      };
    },
    mission: {
      id: 'm-2-2',
      title: 'ภารกิจ: ปรับท่อให้เกิดเสียงความถี่ 346 Hz ที่อุณหภูมิ 25°C',
      description: 'ตั้งอุณหภูมิ T = 25°C (v = 346 m/s) และปรับความยาวท่อ L กับลำดับฮาร์มอนิก n ให้ได้ความถี่สั่นพ้อง f = 346.0 Hz พอดี',
      hint: 'จาก f = n(346 / 2L) = 346 ต้องทำให้ n / (2L) = 1 เช่น ตั้ง n = 2 และ L = 1.0 m หรือ n = 3 และ L = 1.5 m',
      checkPassed: (params, raw) => {
        const passed = params.temp === 25 && Math.abs(raw.freq - 346) <= 1.0;
        return {
          passed,
          progressText: `ความถี่สั่นพ้องปัจจุบัน f = ${raw.freq.toFixed(1)} Hz (เป้าหมาย: 346.0 Hz ที่ 25°C)`,
        };
      },
    },
    quiz: {
      question: 'ระยะห่างระหว่างตำแหน่งดังที่สุด (ปฏิบัพ) สองตำแหน่งที่อยู่ติดกันในหลอดเรโซแนนซ์ มีค่าเท่ากับข้อใด?',
      options: ['1 ความยาวคลื่น (λ)', 'ครึ่งความยาวคลื่น (λ / 2)', 'หนึ่งในสี่ความยาวคลื่น (λ / 4)', 'สองเท่าของความยาวคลื่น (2λ)'],
      correctIndex: 1,
      explanation: 'ในคลื่นนิ่ง ระยะระหว่างบัพถึงบัพถัดไป หรือปฏิบัพถึงปฏิบัพถัดไป มีค่าเท่ากับ λ / 2 เสมอ',
    },
  },

  {
    id: 'wave-03-optics',
    code: 'ว32201-03',
    number: '2.3',
    title: 'แสงเชิงรังสีและเลนส์ 3 มิติ (3D Ray Optics Bench)',
    subtitle: 'ม้านั่งทดลองเลนส์นูน-เลนส์เว้า 3 มิติ และทางเดินรังสีแสง',
    gradeLevel: 'ม.5',
    category: 'waves',
    parameters: [
      { key: 'f', symbol: 'f', label: 'ความยาวโฟกัสเลนส์ (+นูน / -เว้า)', unit: 'cm', min: -30, max: 30, step: 5, defaultValue: 15 },
      { key: 's', symbol: 's', label: 'ระยะวัตถุ (s)', unit: 'cm', min: 5, max: 60, step: 1, defaultValue: 30 },
      { key: 'hObj', symbol: 'y', label: 'ความสูงวัตถุ', unit: 'cm', min: 2, max: 12, step: 1, defaultValue: 6 },
    ],
    vectors: [
      { id: 'rays', label: 'รังสีหลัก 3 เส้น', symbol: '\\vec{R}', color: '#f59e0b', defaultVisible: true },
    ],
    graphTitle: 'กราฟเปรียบเทียบระยะวัตถุ (s) และระยะภาพ (s’)',
    graphXLabel: 'เวลา t (s)',
    graphTraces: [
      { key: 's', label: 'ระยะวัตถุ s', unit: 'cm', color: '#22d3ee' },
      { key: 'sPrime', label: 'ระยะภาพ s’', unit: 'cm', color: '#f59e0b' },
    ],
    theorySummary:
      'การเกิดภาพจากเลนส์บางเป็นไปตามสมการ 1/f = 1/s + 1/s’ โดยเลนส์นูนมีความยาวโฟกัส f > 0 สามารถให้ได้ทั้งภาพจริงหัวกลับ (เมื่อ s > f) และภาพเสมือนหัวตั้งขนาดขยาย (เมื่อ s < f) ส่วนเลนส์เว้า (f < 0) ให้ภาพเสมือนหัวตั้งขนาดย่อเสมอ',
    keyTakeaways: [
      'เมื่อวางวัตถุที่ระยะ s = 2f หน้าเลนส์นูน จะเกิดภาพจริงหัวกลับขนาดเท่าวัตถุที่ระยะ s’ = 2f',
      'กำลังขยายของเลนส์ M = -s’ / s = y’ / y (เครื่องหมายลบหมายถึงภาพจริงหัวกลับ)',
    ],
    realWorldTitle: 'เลนส์กล้องถ่ายรูป แว่นขยาย และการแก้ไขสายตาสั้น-ยาว',
    realWorldDescription:
      'กล้องถ่ายรูปเลื่อนชุดเลนส์เพื่อปรับระยะภาพ s’ ให้ตกบนเซนเซอร์รับภาพพอดี ในขณะที่แว่นขยายวางวัตถุไว้ใกล้กว่าจุดโฟกัส (s < f)',
    computeState: (params) => {
      const f = params.f === 0 ? 5 : params.f;
      const { s, hObj } = params;
      const denom = s - f;
      const sPrime = Math.abs(denom) < 0.1 ? 999 : (s * f) / denom;
      const mag = -sPrime / s;
      const hImg = mag * hObj;
      const imageType = Math.abs(denom) < 0.1 ? 'ภาพที่ระยะอนันต์' : sPrime > 0 ? 'ภาพจริงหัวกลับ' : 'ภาพเสมือนหัวตั้ง';

      return {
        metrics: [
          { label: 'ระยะภาพ', symbol: "s'", value: Math.abs(sPrime) > 300 ? '∞' : sPrime.toFixed(1), unit: 'cm', color: '#f59e0b' },
          { label: 'กำลังขยาย', symbol: 'M', value: Math.abs(sPrime) > 300 ? '∞' : mag.toFixed(2), unit: 'เท่า', color: '#22d3ee' },
          { label: 'ชนิดของภาพ', symbol: 'Type', value: imageType, unit: '', color: sPrime > 0 ? '#10b981' : '#a855f7' },
        ],
        rawMetrics: { f, s, sPrime, mag, hImg },
        equations: [
          {
            title: 'สมการช่างทำเลนส์และตำแหน่งภาพ',
            latexFormula: "\\frac{1}{f} = \\frac{1}{s} + \\frac{1}{s'} \\implies s' = \\frac{sf}{s - f}",
            liveSubstitution: `s' = \\frac{(${s})(${f})}{${s} - (${f})}`,
            resultText: Math.abs(sPrime) > 300 ? "s' \\to \\infty" : `s' = ${sPrime.toFixed(1)}\\text{ cm (${imageType})}`,
          },
        ],
        graphPoint: { s, sPrime: Math.max(-100, Math.min(100, sPrime)) },
      };
    },
    mission: {
      id: 'm-2-3',
      title: 'ภารกิจ: สร้างภาพจริงหัวกลับขนาดขยาย 2 เท่า (M = -2.0)',
      description: 'เลือกใช้เลนส์นูนความยาวโฟกัส f = +20 cm แล้วเลื่อนระยะวัตถุ s ให้เกิดภาพจริงหัวกลับที่มีขนาดขยายเป็น 2 เท่าของวัตถุพอดี (M = -2.0)',
      hint: 'สำหรับภาพจริงขยาย 2 เท่า ต้องวางวัตถุไว้ระหว่าง f และ 2f ที่ระยะ s = 1.5f = 1.5 × 20 = 30 cm',
      checkPassed: (_params, raw) => {
        const passed = raw.f === 20 && Math.abs(raw.mag - -2.0) < 0.05;
        return {
          passed,
          progressText: `f = ${raw.f} cm, s = ${raw.s} cm, กำลังขยาย M = ${raw.mag.toFixed(2)} เท่า (เป้าหมาย: M = -2.00)`,
        };
      },
    },
    quiz: {
      question: 'ถ้าต้องการใช้เลนส์นูนความยาวโฟกัส 15 cm เป็น "แว่นขยาย" ส่องดูตัวอักษรให้เห็นภาพเสมือนหัวตั้งขนาดขยาย ต้องวางเลนส์ห่างจากตัวอักษรเท่าใด?',
      options: ['น้อยกว่า 15 cm', 'เท่ากับ 15 cm พอดี', 'ระหว่าง 15 cm ถึง 30 cm', 'มากกว่า 30 cm'],
      correctIndex: 0,
      explanation: 'เลนส์นูนจะให้ภาพเสมือนหัวตั้งขนาดขยายเมื่อวางวัตถุไว้ในระยะน้อยกว่าความยาวโฟกัส (s < f หรือน้อยกว่า 15 cm)',
    },
  },

  {
    id: 'wave-04-doubleslit',
    code: 'ว32201-04',
    number: '2.4',
    title: 'แสงเชิงฟิสิกส์และการทดลองสลิตคู่ (Physical Optics)',
    subtitle: 'เลเซอร์ 3 มิติ ผ่านสลิตคู่ของยัง (Young’s Double Slit) และสเปกตรัมแสง',
    gradeLevel: 'ม.5',
    category: 'waves',
    parameters: [
      { key: 'wavelength', symbol: '\\lambda', label: 'ความยาวคลื่นแสงเลเซอร์', unit: 'nm', min: 400, max: 700, step: 10, defaultValue: 650 },
      { key: 'slitD', symbol: 'd', label: 'ระยะห่างระหว่างช่องสลิตคู่', unit: 'mm', min: 0.1, max: 0.5, step: 0.05, defaultValue: 0.25 },
      { key: 'screenL', symbol: 'L', label: 'ระยะห่างจากสลิตถึงฉากรับภาพ', unit: 'm', min: 1.0, max: 3.0, step: 0.2, defaultValue: 2.0 },
    ],
    vectors: [
      { id: 'beam', label: 'ลำแสงเลเซอร์', symbol: '\\vec{k}', color: '#f43f5e', defaultVisible: true },
    ],
    graphTitle: 'กราฟความเข้มแสงการแทรกสอด I(x) บนฉาก',
    graphXLabel: 'เวลา/ตำแหน่ง',
    graphTraces: [
      { key: 'dx', label: 'ระยะห่างแถบสว่าง Δx', unit: 'mm', color: '#22d3ee' },
    ],
    theorySummary:
      'การทดลองสลิตคู่ของโธมัส ยัง พิสูจน์ว่าแสงมีสมบัติเป็นคลื่น เมื่อแสงความยาวคลื่นเดียว (Monochromatic Light) ผ่านช่องแคบคู่ จะเกิดแถบสว่างและแถบมืดสลับกันบนฉากตามสมการ d sin θ = d(x / L) = nλ',
    keyTakeaways: [
      'แสงสีม่วง-น้ำเงินมีความยาวคลื่นสั้น (~400-450 nm) ให้แถบสว่างชิดกัน ส่วนแสงสีแดง (~650-700 nm) ให้แถบสว่างห่างกัน',
      'ระยะห่างระหว่างแถบสว่างที่อยู่ติดกันคือ Δx = λL / d',
    ],
    realWorldTitle: 'การวัดระดับนาโนด้วยเลเซอร์อินเตอร์เฟอโรมิเตอร์ และแผ่นโฮโลแกรม',
    realWorldDescription:
      'ลวดลายการแทรกสอดของแสงเลเซอร์ใช้ตรวจวัดความหนาของฟิล์มบางระดับนาโนเมตรและใช้ตรวจจับคลื่นความโน้มถ่วงในหอสังเกตการณ์ LIGO',
    computeState: (params) => {
      const { wavelength, slitD, screenL } = params;
      const lambdaM = wavelength * 1e-9;
      const dM = slitD * 1e-3;
      const deltaXmm = ((lambdaM * screenL) / dM) * 1000;
      const colorName =
        wavelength < 450 ? 'ม่วง-น้ำเงิน' : wavelength < 500 ? 'ฟ้า' : wavelength < 565 ? 'เขียว' : wavelength < 600 ? 'เหลือง-ส้ม' : 'แดง';

      return {
        metrics: [
          { label: 'สีของแสงเลเซอร์', symbol: 'Color', value: colorName, unit: `${wavelength} nm`, color: '#f43f5e' },
          { label: 'ความกว้างแถบสว่าง (Δx)', symbol: '\\Delta x', value: deltaXmm.toFixed(2), unit: 'mm', color: '#22d3ee' },
          { label: 'ตำแหน่งแถบสว่างลำดับที่ 3', symbol: 'x_3', value: (3 * deltaXmm).toFixed(2), unit: 'mm', color: '#10b981' },
        ],
        rawMetrics: { wavelength, slitD, screenL, deltaXmm },
        equations: [
          {
            title: 'สมการระยะห่างระหว่างแถบสว่างบนฉาก',
            latexFormula: '\\Delta x = \\frac{\\lambda L}{d}',
            liveSubstitution: `\\Delta x = \\frac{(${wavelength}\\times 10^{-9}\\text{ m})(${screenL}\\text{ m})}{${slitD}\\times 10^{-3}\\text{ m}}`,
            resultText: `\\Delta x = ${deltaXmm.toFixed(2)}\\text{ mm}`,
          },
        ],
        graphPoint: { dx: deltaXmm },
      };
    },
    mission: {
      id: 'm-2-4',
      title: 'ภารกิจ: ใช้เลเซอร์สีเขียว (530 nm) สร้างแถบสว่างห่างกัน 5.30 mm',
      description: 'ปรับความยาวคลื่นแสงเลเซอร์ไปที่สีเขียว λ = 530 nm แล้วปรับระยะห่างสลิต d และระยะฉาก L ให้แถบสว่างแต่ละแถบห่างกัน Δx = 5.30 mm พอดี',
      hint: 'จาก Δx = λL / d ถ้า λ = 530 nm ลองตั้ง L = 2.0 m และ d = 0.20 mm จะได้ L/d = 10,000 หรือ Δx = 5.30 mm',
      checkPassed: (params, raw) => {
        const passed = params.wavelength === 530 && Math.abs(raw.deltaXmm - 5.3) < 0.08;
        return {
          passed,
          progressText: `λ = ${params.wavelength} nm, Δx = ${raw.deltaXmm.toFixed(2)} mm (เป้าหมาย: 5.30 mm)`,
        };
      },
    },
    quiz: {
      question: 'ในการทดลองสลิตคู่ของยัง หากเปลี่ยนแหล่งกำเนิดแสงจากเลเซอร์สีแดง (650 nm) เป็นเลเซอร์สีม่วง (410 nm) แถบการแทรกสอดบนฉากจะเป็นอย่างไร?',
      options: ['แถบสว่างห่างกันมากขึ้น', 'แถบสว่างเบียดชิดกันมากขึ้น', 'แถบสว่างมีระยะห่างเท่าเดิมแต่สว่างขึ้น', 'ไม่เกิดการแทรกสอด'],
      correctIndex: 1,
      explanation: 'จาก Δx = λL/d แสงสีม่วงมีความยาวคลื่น λ สั้นกว่าแสงสีแดง จึงทำให้ระยะห่างระหว่างแถบสว่าง Δx ลดลง (แถบชิดกันมากขึ้น)',
    },
  },

  // ============================================================================
  // หมวดที่ 3: ไฟฟ้าและแม่เหล็ก (Electricity & Magnetism) - 4 บทเรียน
  // ============================================================================
  {
    id: 'em-01-coulomb',
    code: 'ว32202-01',
    number: '3.1',
    title: 'ไฟฟ้าสถิตและสนามไฟฟ้า 3 มิติ (3D Electrostatics)',
    subtitle: 'เส้นสนามไฟฟ้า 3 มิติ กฎของคูลอมบ์ และพื้นผิวสมศักย์',
    gradeLevel: 'ม.5',
    category: 'electromagnetism',
    parameters: [
      { key: 'q1', symbol: 'q_1', label: 'ประจุตัวที่ 1', unit: 'μC', min: -10, max: 10, step: 1, defaultValue: 6 },
      { key: 'q2', symbol: 'q_2', label: 'ประจุตัวที่ 2', unit: 'μC', min: -10, max: 10, step: 1, defaultValue: -6 },
      { key: 'r', symbol: 'r', label: 'ระยะห่างระหว่างประจุ', unit: 'm', min: 0.2, max: 2.0, step: 0.1, defaultValue: 0.6 },
    ],
    vectors: [
      { id: 'Fe', label: 'แรงทางไฟฟ้า (F)', symbol: '\\vec{F}_e', color: '#f59e0b', defaultVisible: true },
      { id: 'Efield', label: 'เส้นสนามไฟฟ้า 3 มิติ', symbol: '\\vec{E}', color: '#22d3ee', defaultVisible: true },
    ],
    graphTitle: 'กราฟแรงคูลอมบ์ (F) และพลังงานศักย์ไฟฟ้า (U)',
    graphXLabel: 'เวลา t (s)',
    graphTraces: [
      { key: 'F', label: 'ขนาดแรง F', unit: 'N', color: '#f59e0b' },
      { key: 'E', label: 'สนามไฟฟ้ากึ่งกลาง', unit: 'kN/C', color: '#22d3ee' },
    ],
    theorySummary:
      'กฎของคูลอมบ์ระบุว่าแรงระหว่างประจุไฟฟ้าสองจุดแปรผันตรงกับผลคูณของขนาดประจุ และแปรผกผันกับกำลังสองของระยะห่าง (F = k|q₁q₂|/r²) โดยเส้นสนามไฟฟ้าจะพุ่งออกจากประจุบวกและพุ่งเข้าหาประจุลบในอวกาศ 3 มิติ',
    keyTakeaways: [
      'ประจุชนิดเดียวกันผลักกัน (q₁q₂ > 0) และประจุต่างชนิดกันดึงดูดกัน (q₁q₂ < 0)',
      'ณ จุดกึ่งกลางระหว่างประจุบวกสองตัวที่มีขนาดเท่ากัน สนามไฟฟ้าลัพธ์ E = 0 แต่ศักย์ไฟฟ้า V = 2kq/r ไม่เป็นศูนย์!',
    ],
    realWorldTitle: 'เครื่องพ่นสีไฟฟ้าสถิตและเครื่องกรองฝุ่น PM2.5 แบบอิเล็กโทรสแตติก',
    realWorldDescription:
      'ละอองสีที่ถูกอัดประจุบวกจะวิ่งไปเกาะตัวถังรถยนต์ที่ต่อสายดินเป็นประจุลบอย่างสม่ำเสมอด้วยแรงดึงดูดคูลอมบ์',
    computeState: (params) => {
      const { q1, q2, r } = params;
      const k = 8.99e9;
      const F = (k * Math.abs(q1 * 1e-6 * q2 * 1e-6)) / (r * r);
      const rMid = r / 2;
      const E1 = (k * q1 * 1e-6) / (rMid * rMid);
      const E2 = (k * q2 * 1e-6) / (rMid * rMid);
      const EMid = Math.abs(E1 - E2) / 1000;
      const forceType = q1 * q2 < 0 ? 'แรงดึงดูด' : q1 * q2 > 0 ? 'แรงผลัก' : 'ไม่มีแรง';

      return {
        metrics: [
          { label: 'แรงระหว่างประจุ', symbol: 'F_e', value: F.toFixed(2), unit: `N (${forceType})`, color: '#f59e0b' },
          { label: 'สนามไฟฟ้าจุดกึ่งกลาง', symbol: 'E_{mid}', value: EMid.toFixed(0), unit: 'kN/C', color: '#22d3ee' },
        ],
        rawMetrics: { F, EMid },
        equations: [
          {
            title: 'กฎของคูลอมบ์',
            latexFormula: 'F = \\frac{k|q_1 q_2|}{r^2}',
            liveSubstitution: `F = \\frac{(9\\times 10^9)|(${q1})(${q2})\\times 10^{-12}|}{(${r})^2}`,
            resultText: `F = ${F.toFixed(2)}\\text{ N (${forceType})}`,
          },
        ],
        graphPoint: { F, E: EMid },
      };
    },
    mission: {
      id: 'm-3-1',
      title: 'ภารกิจ: สร้างจุดสะเทินที่จุดกึ่งกลาง (E_mid = 0)',
      description: 'ตั้งประจุทั้งสองให้มีค่าไม่เป็นศูนย์ (|q| ≥ 4 μC) และทำให้จุดกึ่งกลางระหว่างประจุทั้งสองเป็น "จุดสะเทิน" ที่สนามไฟฟ้าลัพธ์ E_mid = 0 kN/C',
      hint: 'จุดสะเทินจะอยู่กึ่งกลางพอดีเมื่อประจุทั้งสองมี "ชนิดเดียวกันและขนาดเท่ากัน" เช่น q₁ = +6 μC และ q₂ = +6 μC',
      checkPassed: (params, raw) => {
        const passed = Math.abs(params.q1) >= 4 && params.q1 === params.q2 && raw.EMid < 1;
        return {
          passed,
          progressText: `q₁ = ${params.q1} μC, q₂ = ${params.q2} μC, สนามไฟฟ้ากึ่งกลาง E_mid = ${raw.EMid.toFixed(0)} kN/C`,
        };
      },
    },
    quiz: {
      question: 'ถ้าระยะห่างระหว่างจุดประจุสองจุดเพิ่มขึ้นเป็น 3 เท่า แรงทางไฟฟ้าระหว่างประจุทั้งสองจะเปลี่ยนไปอย่างไร?',
      options: ['ลดลงเหลือ 1/3 เท่า', 'ลดลงเหลือ 1/9 เท่า', 'เพิ่มขึ้นเป็น 3 เท่า', 'เพิ่มขึ้นเป็น 9 เท่า'],
      correctIndex: 1,
      explanation: 'จากกฎของคูลอมบ์ F ∝ 1/r² ดังนั้นเมื่อระยะห่าง r เพิ่มเป็น 3 เท่า แรงจะลดลงเป็น 1/(3²) = 1/9 เท่า',
    },
  },

  {
    id: 'em-02-circuit',
    code: 'ว32202-02',
    number: '3.2',
    title: 'วงจรไฟฟ้ากระแสตรง (3D DC Circuit Lab)',
    subtitle: 'โต๊ะต่อวงจรไฟฟ้า 3 มิติ การไหลของอิเล็กตรอน และกฎของโอห์ม',
    gradeLevel: 'ม.5',
    category: 'electromagnetism',
    parameters: [
      { key: 'emf', symbol: '\\mathcal{E}', label: 'แรงเคลื่อนไฟฟ้าแบตเตอรี่', unit: 'V', min: 3, max: 24, step: 1, defaultValue: 12 },
      { key: 'R1', symbol: 'R_1', label: 'ความต้านทานตัวที่ 1', unit: 'Ω', min: 1, max: 20, step: 1, defaultValue: 4 },
      { key: 'R2', symbol: 'R_2', label: 'ความต้านทานตัวที่ 2', unit: 'Ω', min: 1, max: 20, step: 1, defaultValue: 8 },
      { key: 'mode', symbol: 'Mode', label: 'รูปแบบวงจร (0=อนุกรม, 1=ขนาน)', unit: '', min: 0, max: 1, step: 1, defaultValue: 0 },
    ],
    vectors: [
      { id: 'current', label: 'ทิศทางกระแสสมมติ (I)', symbol: '\\vec{I}', color: '#f59e0b', defaultVisible: true },
    ],
    graphTitle: 'กราฟกระแสไฟฟ้ารวม (I) และกำลังไฟฟ้า (P)',
    graphXLabel: 'เวลา t (s)',
    graphTraces: [
      { key: 'I', label: 'กระแสไฟฟ้า I', unit: 'A', color: '#22d3ee' },
      { key: 'P', label: 'กำลังไฟฟ้า P', unit: 'W', color: '#f59e0b' },
    ],
    theorySummary:
      'ตามกฎของโอห์ม (V = IR) และกฎของเคอร์ชอฟฟ์ การต่อตัวต้านทานแบบอนุกรมทำให้กระแสไหลเท่ากันทุกตัวและแรงดันถูกแบ่ง (R_eq = R₁ + R₂) ส่วนการต่อแบบขนานทำให้แรงดันตกคร่อมเท่ากันและกระแสถูกแยกไหล (1/R_eq = 1/R₁ + 1/R₂)',
    keyTakeaways: [
      'ในวงจรแบ่งแรงดัน (อนุกรม): V₂ = E × R₂ / (R₁ + R₂)',
      'กำลังไฟฟ้าที่หลอดไฟใช้ P = IV = I²R = V²/R เป็นตัวกำหนดความสว่างของหลอดไฟ 3D ในวงจร',
    ],
    realWorldTitle: 'การเดินสายไฟในบ้านเรือน (ต่อขนาน) และวงจรแบ่งแรงดันเซ็นเซอร์',
    realWorldDescription:
      'เครื่องใช้ไฟฟ้าในบ้านทุกชิ้นต่อแบบขนานกับไฟ 220V เพื่อให้แต่ละเครื่องได้รับแรงดันเท่ากันและเปิด-ปิดแยกกันได้อย่างอิสระ',
    computeState: (params) => {
      const { emf, R1, R2, mode } = params;
      const isParallel = mode >= 0.5;
      const Req = isParallel ? (R1 * R2) / (R1 + R2) : R1 + R2;
      const I = emf / Req;
      const V2 = isParallel ? emf : emf * (R2 / (R1 + R2));
      const P = emf * I;

      return {
        metrics: [
          { label: 'ความต้านทานสมมูล', symbol: 'R_{eq}', value: Req.toFixed(2), unit: `Ω (${isParallel ? 'ขนาน' : 'อนุกรม'})`, color: '#a855f7' },
          { label: 'กระแสไฟฟ้ารวม', symbol: 'I', value: I.toFixed(2), unit: 'A', color: '#22d3ee' },
          { label: 'แรงดันตกคร่อม R₂', symbol: 'V_2', value: V2.toFixed(2), unit: 'V', color: '#f59e0b' },
        ],
        rawMetrics: { Req, I, V2, P, isParallel: isParallel ? 1 : 0 },
        equations: [
          {
            title: isParallel ? 'ความต้านทานรวมแบบขนาน' : 'ความต้านทานรวมแบบอนุกรม',
            latexFormula: isParallel ? 'R_{eq} = \\frac{R_1 R_2}{R_1 + R_2}' : 'R_{eq} = R_1 + R_2',
            liveSubstitution: isParallel ? `R_{eq} = \\frac{(${R1})(${R2})}{${R1} + ${R2}}` : `R_{eq} = ${R1} + ${R2}`,
            resultText: `R_{eq} = ${Req.toFixed(2)}\\text{ }\\Omega,\\quad I = \\frac{\\mathcal{E}}{R_{eq}} = ${I.toFixed(2)}\\text{ A}`,
          },
        ],
        graphPoint: { I, P },
      };
    },
    mission: {
      id: 'm-3-2',
      title: 'ภารกิจ: ต่อวงจรแบ่งแรงดันจากแหล่งจ่าย 12V ให้ได้ V₂ = 4.00 V',
      description: 'ตั้งแหล่งจ่ายไฟ E = 12 V และต่อวงจรแบบอนุกรม (Mode = 0) แล้วปรับค่า R₁ และ R₂ ให้แรงดันตกคร่อมตัวต้านทาน R₂ มีค่า V₂ = 4.00 V พอดี',
      hint: 'จาก V₂ = 12 × R₂ / (R₁ + R₂) = 4 ต้องให้ R₁ เป็น 2 เท่าของ R₂ เช่น ตั้ง R₁ = 8 Ω และ R₂ = 4 Ω',
      checkPassed: (params, raw) => {
        const passed = params.emf === 12 && raw.isParallel === 0 && Math.abs(raw.V2 - 4.0) < 0.05;
        return {
          passed,
          progressText: `แรงดัน V₂ ปัจจุบัน = ${raw.V2.toFixed(2)} V (เป้าหมาย: 4.00 V ในโหมดอนุกรม)`,
        };
      },
    },
    quiz: {
      question: 'เมื่อนำตัวต้านทาน 6 Ω และ 3 Ω มาต่อกันแบบขนาน ความต้านทานสมมูลของวงจรจะมีค่าเท่าใด?',
      options: ['9 Ω', '4.5 Ω', '2 Ω', '0.5 Ω'],
      correctIndex: 2,
      explanation: 'จาก R_eq = (R₁ × R₂) / (R₁ + R₂) = (6 × 3) / (6 + 3) = 18 / 9 = 2 Ω',
    },
  },

  {
    id: 'em-03-lorentz',
    code: 'ว32202-03',
    number: '3.3',
    title: 'ประจุในสนามแม่เหล็ก 3 มิติ (3D Lorentz Force & Cyclotron)',
    subtitle: 'อนุภาคมีประจุวิ่งเป็นเกลียว 3 มิติ (3D Helix) และกฎมือขวา',
    gradeLevel: 'ม.6',
    category: 'electromagnetism',
    parameters: [
      { key: 'B', symbol: 'B', label: 'ความเข้มสนามแม่เหล็ก', unit: 'T', min: 0.5, max: 5.0, step: 0.5, defaultValue: 2.0 },
      { key: 'v', symbol: 'v', label: 'อัตราเร็วของอนุภาค', unit: 'm/s', min: 2, max: 20, step: 1, defaultValue: 10 },
      { key: 'pitchAngle', symbol: '\\theta', label: 'มุมยิงเทียบกับสนามแม่เหล็ก', unit: '°', min: 30, max: 90, step: 5, defaultValue: 75 },
    ],
    vectors: [
      { id: 'vVec', label: 'ความเร็วอนุภาค (v)', symbol: '\\vec{v}', color: '#22d3ee', defaultVisible: true },
      { id: 'BVec', label: 'สนามแม่เหล็ก (B)', symbol: '\\vec{B}', color: '#a855f7', defaultVisible: true },
      { id: 'FBVec', label: 'แรงแม่เหล็ก (F = qv×B)', symbol: '\\vec{F}_B', color: '#f43f5e', defaultVisible: true },
    ],
    graphTitle: 'กราฟรัศมีวงโคจรไซโคลตรอน (R) และขนาดแรงลอเรนตซ์ (F_B)',
    graphXLabel: 'เวลา t (s)',
    graphTraces: [
      { key: 'R', label: 'รัศมีวงโคจร R', unit: 'm', color: '#22d3ee' },
      { key: 'FB', label: 'แรงแม่เหล็ก F_B', unit: 'N', color: '#f43f5e' },
    ],
    theorySummary:
      'เมื่ออนุภาคที่มีประจุ q เคลื่อนที่ด้วยความเร็ว v เข้าไปในสนามแม่เหล็ก B จะเกิดแรงแม่เหล็ก F_B = q(v × B) ซึ่งมีทิศตั้งฉากกับทั้ง v และ B ตามกฎมือขวา ทำให้อนุภาคเคลื่อนที่เป็นวงกลมหรือเป็นเกลียว 3 มิติ (Helix) ด้วยรัศมี R = mv sin θ / (qB)',
    keyTakeaways: [
      'เนื่องจากแรงแม่เหล็กตั้งฉากกับความเร็วเสมอ แรงแม่เหล็กจึงไม่ทำงาน (W = 0) อัตราเร็วของอนุภาคจึงคงตัว!',
      'หากยิงตั้งฉาก (θ = 90°) จะได้ทางเดินเป็นวงกลม หากยิงทำมุมเฉียง (0° < θ < 90°) จะได้ทางเดินเป็นเกลียว 3 มิติ',
    ],
    realWorldTitle: 'แสงเหนือ-แสงใต้ (Aurora) และเครื่องเร่งอนุภาค CERN',
    realWorldDescription:
      'อนุภาคลมสุริยะจากดวงอาทิตย์ถูกสนามแม่เหล็กโลกบังคับให้วิ่งควงสว่านเป็นเกลียว 3 มิติตามเส้นแรงแม่เหล็กลงสู่ขั้วโลกเหนือและขั้วโลกใต้',
    computeState: (params) => {
      const { B, v, pitchAngle } = params;
      const qOverM = 1.0; // Normalized charge-to-mass ratio for visualization
      const rad = (pitchAngle * Math.PI) / 180;
      const vPerp = v * Math.sin(rad);
      const vPara = v * Math.cos(rad);
      const R = vPerp / (qOverM * B);
      const FB = qOverM * vPerp * B;

      return {
        metrics: [
          { label: 'รัศมีวงโคจรเกลียว', symbol: 'R', value: R.toFixed(2), unit: 'm', color: '#22d3ee' },
          { label: 'แรงลอเรนตซ์', symbol: 'F_B', value: FB.toFixed(1), unit: 'N', color: '#f43f5e' },
          { label: 'ความเร็วขนานสนาม', symbol: 'v_{\\parallel}', value: vPara.toFixed(1), unit: 'm/s', color: '#10b981' },
        ],
        rawMetrics: { R, FB, vPerp, vPara },
        equations: [
          {
            title: 'แรงแม่เหล็กลอเรนตซ์และรัศมีไซโคลตรอน',
            latexFormula: 'qvB\\sin\\theta = \\frac{mv_{\\perp}^2}{R} \\implies R = \\frac{mv\\sin\\theta}{qB}',
            liveSubstitution: `R = \\frac{(1)(${v})\\sin(${pitchAngle}^\\circ)}{(1)(${B})}`,
            resultText: `R = ${R.toFixed(2)}\\text{ m}`,
          },
        ],
        graphPoint: { R, FB },
      };
    },
    mission: {
      id: 'm-3-3',
      title: 'ภารกิจ: บังคับประจุให้วิ่งเป็นวงกลมแบนราบ (ไม่เป็นเกลียว) รัศมี R = 3.00 m',
      description: 'ปรับมุมยิง θ ให้ประจุวิ่งตั้งฉากกับสนามแม่เหล็ก (เป็นวงกลมระนาบเดียว) และปรับ v กับ B ให้ได้รัศมีวงโคจร R = 3.00 m พอดี',
      hint: 'ตั้งมุมยิง θ = 90° (เพื่อให้ v_∥ = 0) แล้วตั้งอัตราส่วน v / B = 3 เช่น v = 12 m/s และ B = 4.0 T',
      checkPassed: (params, raw) => {
        const passed = params.pitchAngle === 90 && Math.abs(raw.R - 3.0) < 0.05;
        return {
          passed,
          progressText: `มุม θ = ${params.pitchAngle}°, รัศมี R = ${raw.R.toFixed(2)} m (เป้าหมาย: θ = 90°, R = 3.00 m)`,
        };
      },
    },
    quiz: {
      question: 'เมื่ออิเล็กตรอนเคลื่อนที่เข้าไปในสนามแม่เหล็กสม่ำเสมอในทิศขนานกับเส้นสนามแม่เหล็ก (θ = 0°) อิเล็กตรอนจะมีแนวการเคลื่อนที่อย่างไร?',
      options: ['เป็นวงกลม', 'เป็นเกลียว 3 มิติ', 'เป็นเส้นตรงด้วยความเร็วคงตัว', 'เป็นรูปพาราโบลา'],
      correctIndex: 2,
      explanation: 'จาก F = qvB sin θ เมื่อเคลื่อนที่ขนานกับสนามแม่เหล็ก (θ = 0° หรือ 180°) จะได้ sin 0° = 0 จึงไม่มีแรงแม่เหล็กกระทำ อิเล็กตรอนจึงเคลื่อนที่เป็นเส้นตรงต่อไป',
    },
  },

  {
    id: 'em-04-faraday',
    code: 'ว33201-01',
    number: '3.4',
    title: 'การเหนี่ยวนำแม่เหล็กไฟฟ้าและไฟฟ้ากระแสสลับ (Faraday & AC)',
    subtitle: 'ไดนาโมปั่นไฟ 3 มิติ กฎของฟาราเดย์ และวงจรสั่นพ้อง RLC',
    gradeLevel: 'ม.6',
    category: 'electromagnetism',
    parameters: [
      { key: 'freq', symbol: 'f', label: 'ความถี่การหมุนขดลวดไดนาโม', unit: 'Hz', min: 10, max: 100, step: 5, defaultValue: 50 },
      { key: 'L', symbol: 'L', label: 'ความเหนี่ยวนำขดลวด (L)', unit: 'mH', min: 10, max: 100, step: 5, defaultValue: 50 },
      { key: 'C', symbol: 'C', label: 'ความจุตัวเก็บประจุ (C)', unit: 'μF', min: 50, max: 400, step: 10, defaultValue: 200 },
    ],
    vectors: [
      { id: 'flux', label: 'ฟลักซ์แม่เหล็ก (Φ_B)', symbol: '\\vec{\\Phi}_B', color: '#22d3ee', defaultVisible: true },
    ],
    graphTitle: 'กราฟความต้านทานเชิงเหนี่ยวนำ (X_L) vs ความต้านทานเชิงความจุ (X_C)',
    graphXLabel: 'เวลา t (s)',
    graphTraces: [
      { key: 'XL', label: 'X_L (ตัวเหนี่ยวนำ)', unit: 'Ω', color: '#22d3ee' },
      { key: 'XC', label: 'X_C (ตัวเก็บประจุ)', unit: 'Ω', color: '#f59e0b' },
    ],
    theorySummary:
      'กฎการเหนี่ยวนำของฟาราเดย์ระบุว่าการเปลี่ยนแปลงฟลักซ์แม่เหล็กที่ตัดผ่านขดลวดจะเหนี่ยวนำให้เกิดแรงเคลื่อนไฟฟ้ากระแสสลับ E = -N dΦ/dt และในวงจร RLC กระแสสลับ จะเกิดการสั่นพ้องทางไฟฟ้า (Resonance) เมื่อ X_L = X_C ทำให้กระแสในวงจรมีค่าสูงสุด',
    keyTakeaways: [
      'ความต้านทานเชิงเหนี่ยวนำ X_L = 2πfL เพิ่มขึ้นตามความถี่ ส่วนความต้านทานเชิงความจุ X_C = 1/(2πfC) ลดลงตามความถี่',
      'ความถี่สั่นพ้องของวงจร RLC คือ f₀ = 1 / (2π√(LC))',
    ],
    realWorldTitle: 'กังหันปั่นไฟฟ้า แท่นชาร์จไร้สาย และวงจรจูนคลื่นวิทยุ',
    realWorldDescription:
      'แท่นชาร์จโทรศัพท์ไร้สายใช้สนามแม่เหล็กสลับเหนี่ยวนำให้เกิดกระแสไฟฟ้าในขดลวดรับภายในตัวเครื่องตามกฎของฟาราเดย์',
    computeState: (params) => {
      const { freq, L, C } = params;
      const omega = 2 * Math.PI * freq;
      const XL = omega * (L * 1e-3);
      const XC = 1 / (omega * (C * 1e-6));
      const R = 10;
      const Z = Math.sqrt(R * R + Math.pow(XL - XC, 2));
      const fRes = 1 / (2 * Math.PI * Math.sqrt(L * 1e-3 * C * 1e-6));

      return {
        metrics: [
          { label: 'ความต้านทานเชิงเหนี่ยวนำ', symbol: 'X_L', value: XL.toFixed(1), unit: 'Ω', color: '#22d3ee' },
          { label: 'ความต้านทานเชิงความจุ', symbol: 'X_C', value: XC.toFixed(1), unit: 'Ω', color: '#f59e0b' },
          { label: 'ความถี่สั่นพ้องของวงจร', symbol: 'f_0', value: fRes.toFixed(1), unit: 'Hz', color: '#10b981' },
        ],
        rawMetrics: { XL, XC, Z, fRes },
        equations: [
          {
            title: 'อิมพีแดนซ์และการสั่นพ้องของวงจร RLC',
            latexFormula: 'Z = \\sqrt{R^2 + (X_L - X_C)^2}, \\quad f_0 = \\frac{1}{2\\pi\\sqrt{LC}}',
            liveSubstitution: `X_L = ${XL.toFixed(1)}\\,\\Omega, \\quad X_C = ${XC.toFixed(1)}\\,\\Omega`,
            resultText: `Z = ${Z.toFixed(1)}\\,\\Omega \\quad (f_0 = ${fRes.toFixed(1)}\\text{ Hz})`,
          },
        ],
        graphPoint: { XL, XC },
      };
    },
    mission: {
      id: 'm-3-4',
      title: 'ภารกิจ: จูนวงจร RLC ให้เกิดการสั่นพ้อง (X_L ≈ X_C)',
      description: 'ปรับความถี่ f, ค่า L หรือค่า C ให้วงจรเกิดการสั่นพ้องทางไฟฟ้า โดยให้ |X_L - X_C| น้อยกว่า 1.5 Ω',
      hint: 'ดูค่า "ความถี่สั่นพ้อง f₀" บนการ์ดตัวเลข แล้วเลื่อนความถี่ f ให้ตรงกับ f₀ (เช่น ที่ L=50 mH, C=200 μF จะได้ f₀ ≈ 50 Hz!)',
      checkPassed: (_params, raw) => {
        const diff = Math.abs(raw.XL - raw.XC);
        const passed = diff <= 1.5;
        return {
          passed,
          progressText: `|X_L - X_C| = ${diff.toFixed(2)} Ω (เป้าหมาย: ≤ 1.50 Ω)`,
        };
      },
    },
    quiz: {
      question: 'ในวงจร RLC ต่ออนุกรมกับแหล่งจ่ายไฟฟ้ากระแสสลับ เมื่อเกิดภาวะสั่นพ้อง (Resonance) ข้อใดกล่าวถูกต้อง?',
      options: ['X_L มีค่ามากกว่า X_C มากที่สุด', 'อิมพีแดนซ์รวม Z มีค่าต่ำสุด (Z = R) และกระแสในวงจรมีค่าสูงสุด', 'กระแสในวงจรเป็นศูนย์', 'มุมเฟสระหว่างแรงดันและกระแสเป็น 90 องศา'],
      correctIndex: 1,
      explanation: 'ที่ความถี่สั่นพ้อง X_L = X_C จะหักล้างกันพอดี ทำให้อิมพีแดนซ์ Z = √(R² + 0) = R มีค่าน้อยที่สุด ส่งผลให้กระแส I = V/Z มีค่าสูงสุด',
    },
  },

  // ============================================================================
  // หมวดที่ 4: สมบัติสสาร ความร้อน และของไหล (Matter, Heat & Fluids) - 3 บทเรียน
  // ============================================================================
  {
    id: 'thermo-01-gas',
    code: 'ว33201-02',
    number: '4.1',
    title: 'แก๊สอุดมคติและทฤษฎีจลน์ของแก๊ส 3 มิติ (3D Kinetic Gas)',
    subtitle: 'กระบอกสูบอะตอมแก๊ส 3 มิติ กฎของแก๊ส และอัตราเร็วอาร์เอ็มเอส',
    gradeLevel: 'ม.6',
    category: 'thermodynamics',
    parameters: [
      { key: 'tempK', symbol: 'T', label: 'อุณหภูมิสัมบูรณ์ของแก๊ส', unit: 'K', min: 100, max: 800, step: 25, defaultValue: 300 },
      { key: 'volume', symbol: 'V', label: 'ปริมาตรกระบอกสูบ', unit: 'L', min: 5, max: 40, step: 1, defaultValue: 20 },
      { key: 'moles', symbol: 'n', label: 'จำนวนโมลของแก๊ส', unit: 'mol', min: 0.5, max: 5.0, step: 0.5, defaultValue: 1.0 },
    ],
    vectors: [
      { id: 'vGas', label: 'ความเร็วโมเลกุลแก๊ส', symbol: '\\vec{v}_{rms}', color: '#10b981', defaultVisible: true },
    ],
    graphTitle: 'กราฟความดันแก๊ส (P) และอัตราเร็ว v_rms',
    graphXLabel: 'เวลา t (s)',
    graphTraces: [
      { key: 'P', label: 'ความดัน P', unit: 'kPa', color: '#22d3ee' },
      { key: 'vRms', label: 'v_rms / 10', unit: '10 m/s', color: '#f59e0b' },
    ],
    theorySummary:
      'ทฤษฎีจลน์ของแก๊สอธิบายว่าความดันของแก๊สเกิดจากการที่โมเลกุลแก๊สวิ่งชนผนังภาชนะอย่างต่อเนื่อง โดยเป็นไปตามสมการแก๊สอุดมคติ PV = nRT และพลังงานจลน์เฉลี่ยของโมเลกุลแก๊สขึ้นอยู่กับอุณหภูมิสัมบูรณ์ (T) เท่านั้น: Ek_avg = (3/2)k_B T',
    keyTakeaways: [
      'เมื่ออัดลูกสูบให้ปริมาตร V ลดลง (ที่อุณหภูมิคงตัว) โมเลกุลจะชนผนังถี่ขึ้น ทำให้ความดัน P เพิ่มขึ้น (กฎของบอยล์)',
      'เมื่อเพิ่มอุณหภูมิ T โมเลกุลแก๊สในกระบอกสูบ 3D จะวิ่งเร็วขึ้นตามสมการ v_rms = √(3RT / M)',
    ],
    realWorldTitle: 'กระบอกสูบเครื่องยนต์สันดาปและบอลลูนอากาศร้อน',
    realWorldDescription:
      'ในจังหวะอัดของเครื่องยนต์ ลูกสูบจะบีบปริมาตรแก๊สให้เล็กลงอย่างรวดเร็ว ทำให้ทั้งความดันและอุณหภูมิพุ่งสูงขึ้น',
    computeState: (params) => {
      const { tempK, volume, moles } = params;
      const R = 8.314;
      const molarMassHe = 0.004; // Helium 4 g/mol
      const PkPa = (moles * R * tempK) / volume;
      const vRms = Math.sqrt((3 * R * tempK) / molarMassHe);
      const uInternal = 1.5 * moles * R * tempK;

      return {
        metrics: [
          { label: 'ความดันแก๊สในกระบอกสูบ', symbol: 'P', value: PkPa.toFixed(1), unit: 'kPa', color: '#22d3ee' },
          { label: 'อัตราเร็ว v_rms (He)', symbol: 'v_{rms}', value: vRms.toFixed(0), unit: 'm/s', color: '#f59e0b' },
          { label: 'พลังงานภายในระบบ', symbol: 'U', value: (uInternal / 1000).toFixed(2), unit: 'kJ', color: '#10b981' },
        ],
        rawMetrics: { PkPa, vRms, uInternal },
        equations: [
          {
            title: 'สมการสถานะแก๊สอุดมคติ',
            latexFormula: 'PV = nRT \\implies P = \\frac{nRT}{V}',
            liveSubstitution: `P = \\frac{(${moles})(8.314)(${tempK})}{${volume}\\times 10^{-3}}`,
            resultText: `P = ${PkPa.toFixed(1)}\\text{ kPa}`,
          },
          {
            title: 'อัตราเร็วรากที่สองของกำลังสองเฉลี่ย',
            latexFormula: 'v_{rms} = \\sqrt{\\frac{3RT}{M}}',
            liveSubstitution: `v_{rms} = \\sqrt{\\frac{3(8.314)(${tempK})}{0.004}}`,
            resultText: `v_{rms} = ${vRms.toFixed(0)}\\text{ m/s}`,
          },
        ],
        graphPoint: { P: PkPa, vRms: vRms / 10 },
      };
    },
    mission: {
      id: 'm-4-1',
      title: 'ภารกิจ: ปรับสภาวะแก๊สให้มีความดัน 249.4 kPa (≈ 2.5 บรรยากาศ)',
      description: 'ปรับจำนวนโมล n, อุณหภูมิ T และปริมาตรกระบอกสูบ V ให้ความดันแก๊ส P อยู่ระหว่าง 245 ถึง 255 kPa',
      hint: 'จาก P = nRT / V ถ้าตั้ง n = 1.0 mol, T = 300 K และกดลูกสูบลงมาที่ V = 10 L จะได้ P = 249.4 kPa พอดี!',
      checkPassed: (_params, raw) => {
        const passed = raw.PkPa >= 245 && raw.PkPa <= 255;
        return {
          passed,
          progressText: `ความดันปัจจุบัน P = ${raw.PkPa.toFixed(1)} kPa (เป้าหมาย: 245 - 255 kPa)`,
        };
      },
    },
    quiz: {
      question: 'หากเพิ่มอุณหภูมิสัมบูรณ์ (K) ของแก๊สอุดมคติในภาชนะปิดจาก 200 K เป็น 800 K (เพิ่ม 4 เท่า) อัตราเร็ว v_rms ของโมเลกุลแก๊สจะเปลี่ยนไปอย่างไร?',
      options: ['เพิ่มขึ้นเป็น 2 เท่า', 'เพิ่มขึ้นเป็น 4 เท่า', 'เพิ่มขึ้นเป็น 16 เท่า', 'เท่าเดิม'],
      correctIndex: 0,
      explanation: 'จาก v_rms = √(3RT/M) อัตราเร็วแปรผันตรงกับรากที่สองของอุณหภูมิสัมบูรณ์ (√T) ดังนั้นเมื่อ T เพิ่ม 4 เท่า v_rms จะเพิ่มเป็น √4 = 2 เท่า',
    },
  },

  {
    id: 'thermo-02-elasticity',
    code: 'ว33201-03',
    number: '4.2',
    title: 'ของแข็งและสภาพยืดหยุ่น (3D Tensile & Young’s Modulus)',
    subtitle: 'เครื่องดึงทดสอบความเค้น-ความเครียด และมอดูลัสของยัง 3 มิติ',
    gradeLevel: 'ม.6',
    category: 'thermodynamics',
    parameters: [
      { key: 'force', symbol: 'F', label: 'แรงดึงเส้นลวดทดสอบ', unit: 'kN', min: 1, max: 50, step: 1, defaultValue: 15 },
      { key: 'area', symbol: 'A', label: 'พื้นที่หน้าตัดเส้นลวด', unit: 'mm²', min: 10, max: 100, step: 5, defaultValue: 50 },
      { key: 'matE', symbol: 'Y', label: 'ค่ามอดูลัสของยังวัสดุ (เหล็ก=200)', unit: 'GPa', min: 50, max: 200, step: 25, defaultValue: 200 },
    ],
    vectors: [
      { id: 'Fpull', label: 'แรงดึงตามยาว (F)', symbol: '\\vec{F}', color: '#f43f5e', defaultVisible: true },
    ],
    graphTitle: 'กราฟความเค้นตามยาว (σ) และระยะยืด (ΔL)',
    graphXLabel: 'เวลา t (s)',
    graphTraces: [
      { key: 'stress', label: 'ความเค้น σ', unit: 'MPa', color: '#f43f5e' },
      { key: 'dL', label: 'ระยะยืด ΔL', unit: 'mm', color: '#22d3ee' },
    ],
    theorySummary:
      'เมื่อของแข็งถูกแรงดึง F กระทำในขอบเขตสภาพยืดหยุ่น อัตราส่วนระหว่างความเค้นตามยาว (σ = F/A) ต่อความเครียดตามยาว (ε = ΔL/L₀) จะมีค่าคงตัวเฉพาะสำหรับวัสดุแต่ละชนิด เรียกว่า "ค่ามอดูลัสของยัง (Young’s Modulus, Y)"',
    keyTakeaways: [
      'ความเค้น σ = F / A มีหน่วยเป็น N/m² หรือ Pa (พาสคัล)',
      'หากความเค้นเกินขีดจำกัดสภาพยืดหยุ่น วัสดุจะเกิดการเสียรูปถาวรและขาดในที่สุด',
    ],
    realWorldTitle: 'การคำนวณสายเคเบิลสะพานแขวนและสลิงลิฟต์โดยสาร',
    realWorldDescription:
      'วิศวกรโยธาคำนวณพื้นที่หน้าตัด A ของสายเคเบิลเหล็กกล้าให้มีความเค้นต่ำกว่าขีดจำกัดความปลอภัยอย่างน้อย 3-5 เท่า',
    computeState: (params) => {
      const { force, area, matE } = params;
      const L0 = 2.0; // 2 meters wire
      const stressMPa = (force * 1000) / area; // kN / mm^2 = GPa -> *1000 = MPa
      const strain = stressMPa / (matE * 1000);
      const dLmm = strain * L0 * 1000;

      return {
        metrics: [
          { label: 'ความเค้นตามยาว (Stress)', symbol: '\\sigma', value: stressMPa.toFixed(0), unit: 'MPa', color: '#f43f5e' },
          { label: 'ความเครียด (Strain)', symbol: '\\varepsilon', value: (strain * 1000).toFixed(2), unit: '×10⁻³', color: '#a855f7' },
          { label: 'ระยะยืดของเส้นลวด 2m', symbol: '\\Delta L', value: dLmm.toFixed(2), unit: 'mm', color: '#22d3ee' },
        ],
        rawMetrics: { stressMPa, strain, dLmm },
        equations: [
          {
            title: 'สมการมอดูลัสของยัง (Young’s Modulus)',
            latexFormula: 'Y = \\frac{\\sigma}{\\varepsilon} = \\frac{F / A}{\\Delta L / L_0}',
            liveSubstitution: `\\sigma = \\frac{${force}\\text{ kN}}{${area}\\text{ mm}^2} = ${stressMPa.toFixed(0)}\\text{ MPa}`,
            resultText: `\\Delta L = \\frac{\\sigma L_0}{Y} = ${dLmm.toFixed(2)}\\text{ mm}`,
          },
        ],
        graphPoint: { stress: stressMPa, dL: dLmm },
      };
    },
    mission: {
      id: 'm-4-2',
      title: 'ภารกิจ: ออกแบบสายเคเบิลเหล็กรับแรงดึง 30 kN โดยความเค้นไม่เกิน 400 MPa',
      description: 'ตั้งแรงดึง F = 30 kN และเลือกวัสดุเหล็กกล้า (Y = 200 GPa) แล้วปรับพื้นที่หน้าตัด A ให้ความเค้น σ เท่ากับ 400 MPa พอดี',
      hint: 'จาก σ = F / A = 30,000 N / A = 400 MPa จะได้ A = 30,000 / 400 = 75 mm²',
      checkPassed: (params, raw) => {
        const passed = params.force === 30 && Math.abs(raw.stressMPa - 400) < 5;
        return {
          passed,
          progressText: `แรงดึง F = ${params.force} kN, ความเค้น σ = ${raw.stressMPa.toFixed(0)} MPa (เป้าหมาย: 400 MPa)`,
        };
      },
    },
    quiz: {
      question: 'ลวดโลหะสองเส้นทำจากวัสดุชนิดเดียวกัน เส้นแรกมีพื้นที่หน้าตัดเป็น 2 เท่าของเส้นที่สอง ค่ามอดูลัสของยัง (Y) ของลวดทั้งสองเป็นอย่างไร?',
      options: ['เส้นแรกมีค่า Y เป็น 2 เท่า', 'เส้นแรกมีค่า Y เป็น 4 เท่า', 'เท่ากัน เพราะเป็นวัสดุชนิดเดียวกัน', 'เส้นที่สองมีค่า Y เป็น 2 เท่า'],
      correctIndex: 2,
      explanation: 'ค่ามอดูลัสของยัง (Y) เป็นสมบัติเฉพาะตัวของวัสดุแต่ละชนิด ไม่ขึ้นกับความยาวหรือพื้นที่หน้าตัดของชิ้นงาน',
    },
  },

  {
    id: 'thermo-03-fluid',
    code: 'ว33201-04',
    number: '4.3',
    title: 'พลศาสตร์ของไหลและสมการแบร์นูลลี 3 มิติ (3D Venturi Tube)',
    subtitle: 'ท่อเวนจูรี 3 มิติ เส้นกระแสของไหล และความดันแบร์นูลลี',
    gradeLevel: 'ม.6',
    category: 'thermodynamics',
    parameters: [
      { key: 'v1', symbol: 'v_1', label: 'อัตราเร็วของไหลท่อใหญ่ (A₁=100 cm²)', unit: 'm/s', min: 1, max: 6, step: 0.5, defaultValue: 2.0 },
      { key: 'areaRatio', symbol: 'A_1/A_2', label: 'อัตราส่วนพื้นที่ท่อใหญ่ต่อคอคอด', unit: 'เท่า', min: 1.5, max: 5.0, step: 0.5, defaultValue: 2.5 },
      { key: 'P1', symbol: 'P_1', label: 'ความดันในท่อส่วนกว้าง (P₁)', unit: 'kPa', min: 100, max: 200, step: 10, defaultValue: 150 },
    ],
    vectors: [
      { id: 'vFlow', label: 'เวกเตอร์ความเร็วของไหล', symbol: '\\vec{v}', color: '#22d3ee', defaultVisible: true },
    ],
    graphTitle: 'กราฟเปรียบเทียบความเร็วคอคอด (v₂) และความดันคอคอด (P₂)',
    graphXLabel: 'เวลา t (s)',
    graphTraces: [
      { key: 'v2', label: 'ความเร็วคอคอด v₂', unit: 'm/s', color: '#22d3ee' },
      { key: 'P2', label: 'ความดันคอคอด P₂', unit: 'kPa', color: '#f59e0b' },
    ],
    theorySummary:
      'จากการอนุรักษ์มวลในสมการความต่อเนื่อง (A₁v₁ = A₂v₂) เมื่อของไหลวิ่งผ่านท่อช่วงคอคอดที่แคบลง อัตราเร็วของไหลจะเพิ่มขึ้น และตามสมการของแบร์นูลลี (P + ½ρv² + ρgh = ค่าคงตัว) บริเวณที่ของไหลมีความเร็วสูงจะมีความดันลดลง!',
    keyTakeaways: [
      'สมการความต่อเนื่อง: A₁v₁ = A₂v₂ (ท่อแคบลง → ไหลเร็วขึ้น)',
      'หลักการของแบร์นูลลี: ไหลเร็ว → ความดันต่ำ / ไหลช้า → ความดันสูง (พื้นฐานแรงยกปีกเครื่องบิน)',
    ],
    realWorldTitle: 'แรงยกปีกเครื่องบินและมาตรวัดอัตราการไหลเวนจูรี',
    realWorldDescription:
      'ปีกเครื่องบินถูกออกแบบให้อากาศด้านบนไหลเร็วกว่าด้านล่าง ความดันด้านบนจึงต่ำกว่าด้านล่าง เกิดเป็นแรงยก (Lift) พยุงเครื่องบินขึ้นสู่ท้องฟ้า',
    computeState: (params) => {
      const { v1, areaRatio, P1 } = params;
      const rho = 1000; // Water kg/m^3
      const v2 = v1 * areaRatio;
      const deltaP = 0.5 * rho * (v2 * v2 - v1 * v1) / 1000; // kPa
      const P2 = P1 - deltaP;

      return {
        metrics: [
          { label: 'ความเร็วที่คอคอด (v₂)', symbol: 'v_2', value: v2.toFixed(1), unit: 'm/s', color: '#22d3ee' },
          { label: 'ความดันลดลง (ΔP)', symbol: '\\Delta P', value: deltaP.toFixed(1), unit: 'kPa', color: '#f43f5e' },
          { label: 'ความดันที่คอคอด (P₂)', symbol: 'P_2', value: P2.toFixed(1), unit: 'kPa', color: '#f59e0b' },
        ],
        rawMetrics: { v1, v2, P1, P2, deltaP },
        equations: [
          {
            title: 'สมการความต่อเนื่อง (Continuity Equation)',
            latexFormula: 'A_1 v_1 = A_2 v_2 \\implies v_2 = \\left(\\frac{A_1}{A_2}\\right)v_1',
            liveSubstitution: `v_2 = (${areaRatio})(${v1})`,
            resultText: `v_2 = ${v2.toFixed(1)}\\text{ m/s}`,
          },
          {
            title: 'สมการของแบร์นูลลีในท่อแนวระดับ',
            latexFormula: 'P_2 = P_1 - \\frac{1}{2}\\rho(v_2^2 - v_1^2)',
            liveSubstitution: `P_2 = ${P1} - \\frac{1}{2}(1000)(${v2.toFixed(1)}^2 - ${v1.toFixed(1)}^2)\\times 10^{-3}`,
            resultText: `P_2 = ${P2.toFixed(1)}\\text{ kPa}`,
          },
        ],
        graphPoint: { v2, P2 },
      };
    },
    mission: {
      id: 'm-4-3',
      title: 'ภารกิจ: เร่งความเร็วของไหลที่คอคอดให้เป็น v₂ = 12.0 m/s',
      description: 'ปรับความเร็วต้น v₁ และอัตราส่วนพื้นที่ A₁/A₂ ให้ความเร็วของไหลที่ช่วงคอคอด v₂ เท่ากับ 12.0 m/s พอดี',
      hint: 'จาก v₂ = (A₁/A₂) × v₁ = 12 เช่น ตั้ง v₁ = 3.0 m/s และ A₁/A₂ = 4.0 เท่า',
      checkPassed: (_params, raw) => {
        const passed = Math.abs(raw.v2 - 12.0) < 0.1;
        return {
          passed,
          progressText: `ความเร็วคอคอดปัจจุบัน v₂ = ${raw.v2.toFixed(1)} m/s (เป้าหมาย: 12.0 m/s)`,
        };
      },
    },
    quiz: {
      question: 'เมื่อน้ำไหลผ่านท่อแนวระดับจากส่วนที่กว้างไปยังส่วนที่แคบลง (คอคอด) ข้อใดอธิบายการเปลี่ยนแปลงของอัตราเร็วและความดันได้ถูกต้อง?',
      options: ['อัตราเร็วเพิ่มขึ้น และความดันเพิ่มขึ้น', 'อัตราเร็วเพิ่มขึ้น และความดันลดลง', 'อัตราเร็วลดลง และความดันเพิ่มขึ้น', 'อัตราเร็วลดลง และความดันลดลง'],
      correctIndex: 1,
      explanation: 'ตามสมการความต่อเนื่อง เมื่อพื้นที่หน้าตัดแคบลง อัตราเร็วจะเพิ่มขึ้น และตามสมการแบร์นูลลี เมื่ออัตราเร็วเพิ่มขึ้น ความดันจะลดลง',
    },
  },

  // ============================================================================
  // หมวดที่ 5: ฟิสิกส์แผนใหม่ (Modern Physics) - 3 บทเรียน
  // ============================================================================
  {
    id: 'mod-01-emwave',
    code: 'ว33202-01',
    number: '5.1',
    title: 'คลื่นแม่เหล็กไฟฟ้า 3 มิติ (3D Electromagnetic Waves)',
    subtitle: 'การสั่นของสนามไฟฟ้า E ตั้งฉากกับสนามแม่เหล็ก B ในอวกาศ 3 มิติ',
    gradeLevel: 'ม.6',
    category: 'modern_physics',
    parameters: [
      { key: 'freqGHz', symbol: 'f', label: 'ความถี่คลื่นแม่เหล็กไฟฟ้า', unit: 'GHz', min: 1, max: 30, step: 1, defaultValue: 10 },
      { key: 'E0', symbol: 'E_0', label: 'แอมพลิจูดสนามไฟฟ้าสูงสุด', unit: 'V/m', min: 30, max: 300, step: 30, defaultValue: 120 },
    ],
    vectors: [
      { id: 'Evec', label: 'สนามไฟฟ้า (แกน Y)', symbol: '\\vec{E}', color: '#22d3ee', defaultVisible: true },
      { id: 'Bvec', label: 'สนามแม่เหล็ก (แกน Z)', symbol: '\\vec{B}', color: '#f43f5e', defaultVisible: true },
    ],
    graphTitle: 'กราฟคลื่นสนามไฟฟ้า E(t) และสนามแม่เหล็ก B(t) ที่มีเฟสตรงกัน',
    graphXLabel: 'เวลา t (s)',
    graphTraces: [
      { key: 'E', label: 'สนามไฟฟ้า E', unit: 'V/m', color: '#22d3ee' },
      { key: 'Bscaled', label: 'สนามแม่เหล็ก c·B', unit: 'V/m', color: '#f43f5e' },
    ],
    theorySummary:
      'เจมส์ เคลิร์ก แมกซ์เวลล์ ค้นพบว่าสนามไฟฟ้าที่เปลี่ยนแปลงตามเวลาจะเหนี่ยวนำให้เกิดสนามแม่เหล็ก และสนามแม่เหล็กที่เปลี่ยนแปลงจะเหนี่ยวนำให้เกิดสนามไฟฟ้า แผ่ออกไปในอวกาศ 3 มิติด้วยอัตราเร็วแสง c = 3×10⁸ m/s โดย E ⊥ B ⊥ c และมีเฟสตรงกันเสมอ',
    keyTakeaways: [
      'สนามไฟฟ้าและสนามแม่เหล็กมีเฟสตรงกัน (ขึ้นสูงสุดและเป็นศูนย์พร้อมกันเสมอ)',
      'อัตราส่วนแอมพลิจูด E₀ / B₀ = c = 3 × 10⁸ m/s',
    ],
    realWorldTitle: 'การสื่อสารไร้สาย 5G, Wi-Fi และเรดาร์ดาวเทียม',
    realWorldDescription:
      'เสาอากาศสมาร์ทโฟนรับ-ส่งคลื่นแม่เหล็กไฟฟ้าในย่านไมโครเวฟ (2.4 - 30 GHz) เพื่อส่งข้อมูลความเร็วสูงผ่านอวกาศโดยไม่ต้องใช้ตัวกลาง',
    computeState: (params, time) => {
      const { freqGHz, E0 } = params;
      const c = 3e8;
      const lambdaCm = (c / (freqGHz * 1e9)) * 100;
      const B0nT = (E0 / c) * 1e9;
      const osc = Math.sin(time * 3);

      return {
        metrics: [
          { label: 'ความยาวคลื่น (λ)', symbol: '\\lambda', value: lambdaCm.toFixed(2), unit: 'cm', color: '#22d3ee' },
          { label: 'สนามแม่เหล็กสูงสุด (B₀)', symbol: 'B_0', value: B0nT.toFixed(0), unit: 'nT', color: '#f43f5e' },
          { label: 'อัตราเร็วคลื่นในสุญญากาศ', symbol: 'c', value: '3.00×10⁸', unit: 'm/s', color: '#10b981' },
        ],
        rawMetrics: { lambdaCm, B0nT },
        equations: [
          {
            title: 'ความสัมพันธ์ระหว่างสนามไฟฟ้าและสนามแม่เหล็ก',
            latexFormula: 'c = f\\lambda = \\frac{E_0}{B_0}',
            liveSubstitution: `\\lambda = \\frac{3\\times 10^8}{${freqGHz}\\times 10^9} = ${(lambdaCm / 100).toFixed(3)}\\text{ m}`,
            resultText: `B_0 = \\frac{${E0}}{3\\times 10^8} = ${B0nT.toFixed(0)}\\text{ nT}`,
          },
        ],
        graphPoint: { E: E0 * osc, Bscaled: E0 * osc * 0.85 },
      };
    },
    mission: {
      id: 'm-5-1',
      title: 'ภารกิจ: ปรับความถี่คลื่นไมโครเวฟให้มีความยาวคลื่น λ = 2.00 cm',
      description: 'ปรับความถี่ f (GHz) ให้ได้คลื่นแม่เหล็กไฟฟ้าที่มีความยาวคลื่น λ = 2.00 cm พอดี',
      hint: 'จาก λ = c / f = 30 cm / f(GHz) ถ้าต้องการ λ = 2.00 cm ต้องตั้ง f = 30 / 2 = 15 GHz',
      checkPassed: (_params, raw) => {
        const passed = Math.abs(raw.lambdaCm - 2.0) < 0.05;
        return {
          passed,
          progressText: `ความยาวคลื่นปัจจุบัน λ = ${raw.lambdaCm.toFixed(2)} cm (เป้าหมาย: 2.00 cm)`,
        };
      },
    },
    quiz: {
      question: 'คลื่นแม่เหล็กไฟฟ้าที่กำลังเคลื่อนที่ไปทางทิศตะวันออก (+X) หาก ณ จุดหนึ่งสนามไฟฟ้ามีทิศชี้ขึ้นด้านบน (+Y) สนามแม่เหล็ก ณ จุดนั้นจะมีทิศทางใด?',
      options: ['ทิศชี้ลงด้านล่าง (-Y)', 'ทิศตะวันออก (+X)', 'ทิศใต้ (+Z) ตั้งฉากกับทั้ง E และทิศการเคลื่อนที่', 'ไม่มีทิศทางแน่นอน'],
      correctIndex: 2,
      explanation: 'ตามกฎมือขวา E × B มีทิศเดียวกับทิศการเคลื่อนที่ c (+X) ดังนั้นเมื่อ E ชี้ไปทาง +Y สนามแม่เหล็ก B ต้องชี้ไปทาง +Z',
    },
  },

  {
    id: 'mod-02-quantum',
    code: 'ว33202-02',
    number: '5.2',
    title: 'ฟิสิกส์อะตอมและปรากฏการณ์โฟโตอิเล็กทริก (3D Quantum Atom)',
    subtitle: 'อะตอมของบอร์ 3 มิติ และการฉายโฟตอนปลดปล่อยโฟโตอิเล็กตรอน',
    gradeLevel: 'ม.6',
    category: 'modern_physics',
    parameters: [
      { key: 'wavelength', symbol: '\\lambda', label: 'ความยาวคลื่นแสงที่ฉายตกกระทบ', unit: 'nm', min: 200, max: 700, step: 10, defaultValue: 350 },
      { key: 'workFunc', symbol: 'W_0', label: 'ฟังก์ชันงานของโลหะ (โซเดียม=2.3)', unit: 'eV', min: 1.5, max: 4.5, step: 0.1, defaultValue: 2.3 },
      { key: 'orbitN', symbol: 'n', label: 'ระดับชั้นพลังงานอะตอมไฮโดรเจน', unit: 'ชั้น', min: 1, max: 4, step: 1, defaultValue: 2 },
    ],
    vectors: [
      { id: 'photon', label: 'โฟตอนแสงตกกระทบ (hf)', symbol: 'hf', color: '#a855f7', defaultVisible: true },
      { id: 'electron', label: 'โฟโตอิเล็กตรอนที่หลุดออก', symbol: 'e^-', color: '#22d3ee', defaultVisible: true },
    ],
    graphTitle: 'กราฟพลังงานโฟตอน (E_photon) เทียบกับฟังก์ชันงาน (W₀) และ Ek_max',
    graphXLabel: 'เวลา t (s)',
    graphTraces: [
      { key: 'Ephoton', label: 'พลังงานโฟตอน hf', unit: 'eV', color: '#a855f7' },
      { key: 'EkMax', label: 'พลังงานจลน์อิเล็กตรอน Ek', unit: 'eV', color: '#22d3ee' },
    ],
    theorySummary:
      'อัลเบิร์ต ไอน์สไตน์ อธิบายปรากฏการณ์โฟโตอิเล็กทริกว่า แสงประกอบด้วยก้อนพลังงานควอนตัมเรียกว่า "โฟตอน" ที่มีพลังงาน E = hf = hc/λ เมื่อโฟตอนชนผิวโลหะที่มีฟังก์ชันงาน W₀ อิเล็กตรอนจะหลุดออกมาได้ก็ต่อเมื่อ hf ≥ W₀ โดยมีพลังงานจลน์สูงสุด Ek_max = hf - W₀',
    keyTakeaways: [
      'พลังงานโฟตอนในหน่วยอิเล็กตรอนโวลต์คำนวณได้ง่ายจาก E (eV) ≈ 1240 / λ (nm)',
      'ระดับชั้นพลังงานของอะตอมไฮโดรเจนตามแบบจำลองของบอร์คือ E_n = -13.6 / n² (eV)',
    ],
    realWorldTitle: 'แผงโซลาร์เซลล์ (Solar Cell) และเซนเซอร์กล้องดิจิทัล CMOS',
    realWorldDescription:
      'แผงโซลาร์เซลล์ใช้ปรากฏการณ์โฟโตอิเล็กทริกและสารกึ่งตัวนำในการเปลี่ยนพลังงานโฟตอนจากแสงอาทิตย์เป็นกระแสไฟฟ้าโดยตรง',
    computeState: (params) => {
      const { wavelength, workFunc, orbitN } = params;
      const Ephoton = 1240 / wavelength;
      const EkMax = Math.max(0, Ephoton - workFunc);
      const En = -13.6 / (orbitN * orbitN);
      const ejected = Ephoton >= workFunc ? 1 : 0;

      return {
        metrics: [
          { label: 'พลังงานโฟตอนแสง', symbol: 'hf', value: Ephoton.toFixed(2), unit: 'eV', color: '#a855f7' },
          { label: 'พลังงานจลน์อิเล็กตรอน', symbol: 'E_{k,max}', value: EkMax.toFixed(2), unit: ejected ? 'eV (หลุด!)' : 'eV (ไม่หลุด)', color: ejected ? '#10b981' : '#f43f5e' },
          { label: `พลังงานชั้น n=${orbitN} (H)`, symbol: `E_${orbitN}`, value: En.toFixed(2), unit: 'eV', color: '#22d3ee' },
        ],
        rawMetrics: { Ephoton, EkMax, En, ejected },
        equations: [
          {
            title: 'สมการโฟโตอิเล็กทริกของไอน์สไตน์',
            latexFormula: 'E_{k,max} = hf - W_0 = \\frac{1240\\text{ eV\\cdot nm}}{\\lambda} - W_0',
            liveSubstitution: `E_{k,max} = \\frac{1240}{${wavelength}} - ${workFunc.toFixed(1)} = ${Ephoton.toFixed(2)} - ${workFunc.toFixed(1)}`,
            resultText: ejected ? `E_{k,max} = ${EkMax.toFixed(2)}\\text{ eV (ศักย์หยุดยั้ง } V_s = ${EkMax.toFixed(2)}\\text{ V)}` : 'hf < W_0 \\text{ (ไม่มีอิเล็กตรอนหลุด)}',
          },
        ],
        graphPoint: { Ephoton, EkMax },
      };
    },
    mission: {
      id: 'm-5-2',
      title: 'ภารกิจ: ฉายแสงลงบนโลหะที่มี W₀ = 2.0 eV ให้ได้อิเล็กตรอน Ek = 1.10 eV',
      description: 'ตั้งค่าฟังก์ชันงานโลหะ W₀ = 2.0 eV แล้วปรับความยาวคลื่นแสง λ ให้โฟโตอิเล็กตรอนที่หลุดออกมามีพลังงานจลน์สูงสุด Ek_max = 1.10 eV พอดี',
      hint: 'ต้องการพลังงานโฟตอน hf = W₀ + Ek = 2.0 + 1.10 = 3.10 eV จาก λ = 1240 / 3.10 = 400 nm!',
      checkPassed: (params, raw) => {
        const passed = Math.abs(params.workFunc - 2.0) < 0.05 && Math.abs(raw.EkMax - 1.1) < 0.05;
        return {
          passed,
          progressText: `W₀ = ${params.workFunc} eV, Ek_max = ${raw.EkMax.toFixed(2)} eV (เป้าหมาย: 1.10 eV)`,
        };
      },
    },
    quiz: {
      question: 'หากฉายแสงที่มีความถี่ต่ำกว่าความถี่ขีดเริ่ม (f < f₀) ลงบนผิวโลหะ แต่เพิ่มความเข้มแสงให้สว่างขึ้นเป็น 10 เท่า จะเกิดผลอย่างไร?',
      options: ['อิเล็กตรอนหลุดออกมาเป็นจำนวนมาก', 'อิเล็กตรอนหลุดออกมาด้วยความเร็วสูงขึ้น', 'ไม่มีอิเล็กตรอนหลุดออกมาเลยแม้แต่ตัวเดียว', 'ฟังก์ชันงานของโลหะลดลง'],
      correctIndex: 2,
      explanation: 'เมื่อความถี่ต่ำกว่าความถี่ขีดเริ่ม (hf < W₀) โฟตอนแต่ละตัวมีพลังงานไม่พอที่จะทำให้อิเล็กตรอนหลุด การเพิ่มความเข้มแสงเป็นเพียงการเพิ่มจำนวนโฟตอน จึงยังคงไม่มีอิเล็กตรอนหลุดออกมา',
    },
  },

  {
    id: 'mod-03-nuclear',
    code: 'ว33202-03',
    number: '5.3',
    title: 'ฟิสิกส์นิวเคลียร์และกัมมันตภาพรังสี 3 มิติ (3D Nuclear Physics)',
    subtitle: 'นิวเคลียส 3 มิติ ครึ่งชีวิตการสลายตัว และเตาปฏิกรณ์ฟิชชัน',
    gradeLevel: 'ม.6',
    category: 'modern_physics',
    parameters: [
      { key: 'halfLife', symbol: 'T_{1/2}', label: 'ครึ่งชีวิตของธาตุกัมมันตรังสี', unit: 'วินาที', min: 1, max: 10, step: 0.5, defaultValue: 3.0 },
      { key: 'elapsedT', symbol: 't', label: 'เวลาที่ผ่านไป (t)', unit: 'วินาที', min: 0, max: 15, step: 0.5, defaultValue: 6.0 },
      { key: 'controlRod', symbol: 'Rod', label: 'การสอดแท่งควบคุมโบรอน (%)', unit: '%', min: 0, max: 100, step: 5, defaultValue: 50 },
    ],
    vectors: [
      { id: 'rad', label: 'อนุภาครังสีแอลฟา/บีตา/นิวตรอน', symbol: '\\alpha,\\beta,n', color: '#f43f5e', defaultVisible: true },
    ],
    graphTitle: 'กราฟการสลายตัวของนิวเคลียสกัมมันตรังสี N(t)',
    graphXLabel: 'เวลา t (s)',
    graphTraces: [
      { key: 'Npct', label: 'นิวเคลียสคงเหลือ (%)', unit: '%', color: '#10b981' },
      { key: 'decayed', label: 'สลายตัวไปแล้ว (%)', unit: '%', color: '#f43f5e' },
    ],
    theorySummary:
      'อัตราการสลายตัวของนิวเคลียสกัมมันตรังสีแปรผันตรงกับจำนวนนิวเคลียสที่มีอยู่ในขณะนั้น โดยทุกๆ 1 ช่วงครึ่งชีวิต (T_1/2) จำนวนนิวเคลียสจะลดลงเหลือครึ่งหนึ่งของเดิมเสมอ: N = N₀(1/2)^(t / T_1/2) และในปฏิกิริยาฟิชชัน มวลที่พร่องไป Δm จะเปลี่ยนเป็นพลังงานมหาศาลตามสมการ E = Δmc²',
    keyTakeaways: [
      'ค่าคงตัวการสลายตัว λ = ln(2) / T_1/2 ≈ 0.693 / T_1/2',
      'ในเตาปฏิกรณ์นิวเคลียร์ แท่งควบคุม (Control Rods) ทำหน้าที่ดูดกลืนนิวตรอนเพื่อควบคุมปฏิกิริยาลูกโซ่ให้คงตัว (k_eff = 1.0)',
    ],
    realWorldTitle: 'การหาอายุวัตถุโบราณด้วยคาร์บอน-14 และโรงไฟฟ้านิวเคลียร์',
    realWorldDescription:
      'นักโบราณคดีวัดสัดส่วนคาร์บอน-14 ที่เหลืออยู่ในฟอสซิล (ครึ่งชีวิต 5,730 ปี) เพื่อคำนวณอายุของสิ่งมีชีวิตในอดีต',
    computeState: (params) => {
      const { halfLife, elapsedT, controlRod } = params;
      const nHalfLives = elapsedT / halfLife;
      const remainingPct = 100 * Math.pow(0.5, nHalfLives);
      const decayedPct = 100 - remainingPct;
      const kEff = 1.5 - (controlRod / 100) * 1.0;

      return {
        metrics: [
          { label: 'จำนวนรอบครึ่งชีวิต', symbol: 't / T_{1/2}', value: nHalfLives.toFixed(2), unit: 'รอบ', color: '#22d3ee' },
          { label: 'นิวเคลียสที่เหลืออยู่', symbol: 'N / N_0', value: remainingPct.toFixed(2), unit: '%', color: '#10b981' },
          { label: 'ตัวคูณนิวตรอนเตาปฏิกรณ์', symbol: 'k_{eff}', value: kEff.toFixed(2), unit: kEff === 1 ? 'วิกฤตพอดี' : kEff > 1 ? 'เหนือวิกฤต!' : 'ต่ำกว่าวิกฤต', color: Math.abs(kEff - 1) < 0.05 ? '#10b981' : '#f59e0b' },
        ],
        rawMetrics: { nHalfLives, remainingPct, decayedPct, kEff },
        equations: [
          {
            title: 'สมการการสลายตัวและครึ่งชีวิต',
            latexFormula: 'N(t) = N_0 \\left(\\frac{1}{2}\\right)^{\\frac{t}{T_{1/2}}}',
            liveSubstitution: `N = 100\\% \\times \\left(\\frac{1}{2}\\right)^{\\frac{${elapsedT}}{${halfLife}}}`,
            resultText: `N = ${remainingPct.toFixed(2)}\\% \\text{ (สลายตัวแล้ว } ${decayedPct.toFixed(2)}\\%)`,
          },
        ],
        graphPoint: { Npct: remainingPct, decayed: decayedPct },
      };
    },
    mission: {
      id: 'm-5-3',
      title: 'ภารกิจ: หาเวลาที่นิวเคลียสสลายตัวจนเหลือ 12.50% และคุมเตาปฏิกรณ์ที่ k_eff = 1.00',
      description: 'ปรับเวลา t ให้ธาตุกัมมันตรังสีเหลืออยู่ 12.50% (1/8 ของเดิม) และสอดแท่งควบคุมโบรอนให้เตาปฏิกรณ์อยู่ในสภาวะสมดุลวิกฤตพอดี (k_eff = 1.00)',
      hint: 'การเหลือ 12.5% = (1/2)³ คือผ่านไป 3 รอบครึ่งชีวิต (เช่น T_1/2 = 3 s, t = 9 s) และสอดแท่งควบคุมที่ 50%',
      checkPassed: (_params, raw) => {
        const passed = Math.abs(raw.remainingPct - 12.5) < 0.2 && Math.abs(raw.kEff - 1.0) < 0.02;
        return {
          passed,
          progressText: `คงเหลือ = ${raw.remainingPct.toFixed(2)}% (เป้า 12.50%), k_eff = ${raw.kEff.toFixed(2)} (เป้า 1.00)`,
        };
      },
    },
    quiz: {
      question: 'สารกัมมันตรังสีชนิดหนึ่งมีครึ่งชีวิต 4 วัน หากเริ่มต้นมีสารนี้ 80 กรัม เมื่อเวลาผ่านไป 12 วัน จะเหลือสารกัมมันตรังสีนี้กี่กรัม?',
      options: ['40 กรัม', '20 กรัม', '10 กรัม', '5 กรัม'],
      correctIndex: 2,
      explanation: 'เวลา 12 วัน คิดเป็น 12 / 4 = 3 รอบครึ่งชีวิต ดังนั้นจะเหลือสาร N = 80 × (1/2)³ = 80 / 8 = 10 กรัม',
    },
  },
];
