import { Component, type ReactNode } from "react";

export class ScreenBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="screen empty-state" role="alert">
          <p>页面未能载入，请重新加载。<br /><span lang="en">This page could not load. Please reload to try again.</span></p>
          <button className="primary-btn" onClick={() => window.location.reload()}>重新加载 Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}
