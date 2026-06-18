import { Component, type ReactNode } from "react";

interface Props {
  fallback: ReactNode;
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

/**
 * GLB 로드/렌더가 실패하면 fallback(primitive 여우)으로 대체한다.
 * 라이브가 절대 빈 화면이 되지 않게 하는 안전장치.
 */
export default class ModelErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("[Quiet Orbit] 캐릭터 모델 로드 실패 — primitive 폴백 사용:", error);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
