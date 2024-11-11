import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";

const HistoryLimitAlert = ({ onClose }: { onClose: () => void }) => (
    <Alert variant="destructive" className="mb-4 mx-auto max-w-4xl">
      <AlertTriangle className="h-4 w-4" />
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
  );

  export default HistoryLimitAlert