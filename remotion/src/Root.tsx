import { Composition } from "remotion";
import { OrdoDemo } from "./OrdoDemo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="OrdoDemo"
        component={OrdoDemo}
        durationInFrames={1170}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
