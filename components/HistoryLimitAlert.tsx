import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";

const HistoryLimitAlert = ({ onClose }: { onClose: () => void }) => (
  <div className="absolute inset-x-0 px-2 top-10 mt-3">
    <Alert
      variant="destructive"
      className="mx-auto max-w-4xl bg-background"
    >
      <AlertTriangle className="size-4 w-4" />
      <AlertTitle>Memory Full</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-2">
          You&apos;ve reached the maximum chat history limit. Please clear your chat history to continue the conversation.
        </p>
        <Button
          variant="destructive"
          onClick={onClose}
          className="mt-2"
        >
          Clear History
        </Button>
      </AlertDescription>
    </Alert>
  </div>
);

export default HistoryLimitAlert;