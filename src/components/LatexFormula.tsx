import React, { useMemo } from 'react';
import katex from 'katex';

interface LatexFormulaProps {
  math: string;
  block?: boolean;
  className?: string;
}

export const LatexFormula: React.FC<LatexFormulaProps> = ({ math, block = false, className = '' }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
      });
    } catch {
      return math;
    }
  }, [math, block]);

  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
};
