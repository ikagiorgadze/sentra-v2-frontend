import { useMemo } from 'react';

import { ConversationPanel } from '@/features/sentra/components/chat/ConversationPanel';
import { RightPanel } from '@/features/sentra/components/RightPanel';
import { Sidebar } from '@/features/sentra/components/Sidebar';
import { useDemoConversation } from '@/features/sentra/demo/useDemoConversation';
import type { DemoScenario } from '@/features/sentra/demo/types';

interface AdminDemoPageProps {
  scenarios?: DemoScenario[];
}

export function AdminDemoPage({ scenarios }: AdminDemoPageProps) {
  const controller = useDemoConversation({ scenarios });
  const demoJobProgress =
    controller.appState === 'running'
      ? {
          statusLabel: 'running',
          stageLabel: 'საჯარო დისკურსის შეგროვება',
        }
      : null;

  const scenarioOptions = useMemo(
    () =>
      controller.scenarios.map((scenario) => (
        <option key={scenario.id} value={scenario.id}>
          {scenario.name}
        </option>
      )),
    [controller.scenarios],
  );

  return (
    <div className="dark flex min-h-screen bg-background text-foreground">
      <Sidebar
        recentChats={[]}
        onNewInvestigation={controller.restartScenario}
        onSelectChat={() => undefined}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="border-b border-border px-6 py-4">
          <div className="mx-auto flex w-full max-w-3xl flex-wrap items-end gap-3">
            <label className="flex min-w-[220px] flex-col gap-1 text-xs uppercase tracking-wider text-muted-foreground">
              Scenario
              <select
                aria-label="Scenario"
                className="rounded border border-border bg-card px-3 py-2 text-sm text-foreground"
                value={controller.scenario.id}
                onChange={(event) => controller.setScenario(event.target.value)}
                disabled={!controller.isScenarioValid}
              >
                {scenarioOptions}
              </select>
            </label>

            <button
              type="button"
              onClick={controller.play}
              disabled={!controller.isScenarioValid}
              className="rounded border border-border bg-card px-3 py-2 text-sm hover:bg-card/80"
            >
              Play
            </button>
            <button
              type="button"
              onClick={controller.pause}
              disabled={!controller.isScenarioValid}
              className="rounded border border-border bg-card px-3 py-2 text-sm hover:bg-card/80"
            >
              Pause
            </button>
            <button
              type="button"
              onClick={() => void controller.nextStep()}
              disabled={!controller.isScenarioValid}
              className="rounded border border-border bg-card px-3 py-2 text-sm hover:bg-card/80"
            >
              Next step
            </button>
            <button
              type="button"
              onClick={controller.reset}
              disabled={!controller.isScenarioValid}
              className="rounded border border-border bg-card px-3 py-2 text-sm hover:bg-card/80"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={controller.restartScenario}
              disabled={!controller.isScenarioValid}
              className="rounded border border-border bg-card px-3 py-2 text-sm hover:bg-card/80"
            >
              Restart scenario
            </button>
          </div>
          {controller.validationError && (
            <p className="mx-auto mt-3 w-full max-w-3xl rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {controller.validationError}
            </p>
          )}
        </div>

        <ConversationPanel
          messages={controller.messages}
          pendingProposal={controller.pendingProposal}
          jobProgress={demoJobProgress}
          onSend={() => undefined}
          onStartNewProposal={controller.confirmProposal}
          onUseExistingProposal={() => undefined}
          onEditProposal={() => undefined}
          hideComposer
        />
      </div>

      <RightPanel />
    </div>
  );
}
