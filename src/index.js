import React, { useState } from "react";
import ReactDOM from "react-dom";

import { TrackingProvider } from "./lib/tracking-react";
import ChildComponent from "./child-components";

import { onTrackingEvent } from "./external-tracking";

function App() {
  const [ready, isReady] = useState(false);
  const params = {
    user_id: 1,
    seeker_id: 3
  };
  return (
    <TrackingProvider
      params={{ ...params, ready }}
      onTrackingEvent={onTrackingEvent}
      isReady={ready}
    >
      <div className="App" params={params}>
        <h1>Hello CodeSandbox</h1>
        <h2>Start editing to see some magic happen!</h2>
        <ChildComponent />
        <button onClick={() => isReady(true)}>ready</button>
      </div>
    </TrackingProvider>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
