import React, { ReactElement } from "react";
import { Popup, Icon } from "semantic-ui-react";

import { useNavigate } from "react-router-dom";
import IndexController from "./IndexController";
import Finished from "./Finished";
import { FullScreenNode, JobServer, SetState } from "../../../types";
import { StyledButton } from "../../../styled/StyledSemantic";
import ThemeSelector from "../../Common/Theme";

interface JobControllerProps {
  children: ReactElement;
  jobServer: JobServer;
  unitIndex: number;
  setUnitIndex: SetState<number>;
  unitProgress: number;
  fullScreenButton: ReactElement;
  fullScreenNode: FullScreenNode;
  cantLeave: boolean;
  authForm?: ReactElement;
  health?: any;
}

/**
 * Render an annotator for the provided jobServer class
 *
 * @param {*} jobServer  A jobServer class
 */
const JobController = ({
  children,
  jobServer,
  unitIndex,
  setUnitIndex,
  unitProgress,
  fullScreenButton,
  fullScreenNode,
  cantLeave,
  authForm,
  health,
}: JobControllerProps) => {
  const [maxHeight, maxWidth] = getMaxWindowSize(jobServer);

  return (
    <div
      style={{
        maxWidth,
        maxHeight,
        margin: "0 auto",
        height: "100%",
        width: "100%",
        background: "var(--background)",
        color: "var(--text)",
      }}
    >
      <div
        style={{
          height: "40px",
          width: "100%",
          padding: "3px 5px 0px 5px",
          display: "flex",
          justifyContent: "space-between",
          background: "var(--background-inversed-fixed)",
          color: "var(--text-inversed-fixed)",
          borderBottom: "3px double var(--background-fixed)",
        }}
      >
        <div
          style={{
            flex: "1 1 auto",
            paddingTop: "4px",
            paddingRight: "10px",
            width: "100px",
          }}
        >
          <IndexController
            n={jobServer?.progress?.n_total}
            progressN={unitProgress}
            index={unitIndex}
            setIndex={setUnitIndex}
            canGoBack={jobServer?.progress?.seek_backwards}
            canGoForward={jobServer?.progress?.seek_forwards}
          />
        </div>
        <HeartContainer damage={health?.damage} maxDamage={health?.maxDamage} />
        <div>
          <div>
            <StyledButton.Group>
              <ThemeSelector color="white" />
              {fullScreenButton}
              {cantLeave ? null : (
                <UserButton
                  fullScreenNode={fullScreenNode}
                  jobServer={jobServer}
                  authForm={authForm}
                />
              )}
            </StyledButton.Group>
          </div>
        </div>
      </div>
      <div style={{ height: "calc(100% - 40px)" }}>
        {unitIndex < jobServer?.progress?.n_total ? children : <Finished jobServer={jobServer} />}
      </div>
    </div>
  );
};

interface UserButtonProps {
  fullScreenNode: FullScreenNode;
  jobServer: JobServer;
  authForm: ReactElement;
}

const UserButton = ({ fullScreenNode, jobServer, authForm }: UserButtonProps) => {
  //const [searchParams, setSearchParams] = useSearchParams();

  return (
    <Popup
      wide
      mountNode={fullScreenNode}
      position="bottom right"
      on="click"
      trigger={
        <StyledButton
          icon="cancel"
          size="massive"
          style={{
            background: "transparent",
            color: "var(--text-inversed-fixed)",
            cursor: "pointer",
            padding: "4px 1px",
          }}
        />
      }
    >
      <Popup.Content>
        <StyledButton.Group vertical fluid>
          {jobServer?.return_link ? <BackToOverview jobServer={jobServer} /> : authForm}
        </StyledButton.Group>
      </Popup.Content>
    </Popup>
  );
};

interface BackToOverviewProps {
  jobServer: JobServer;
}

const BackToOverview = ({ jobServer }: BackToOverviewProps) => {
  const navigate = useNavigate();
  if (!jobServer?.return_link) return null;
  return (
    <StyledButton
      primary
      icon="home"
      content="Close job"
      onClick={() => navigate(jobServer.return_link)}
    />
  );
};

const getMaxWindowSize = (jobServer: JobServer) => {
  switch (jobServer?.codebook?.type) {
    case "questions":
      return ["100%", "1000px"];
    case "annotate":
      return ["100%", "2000px"];
    default:
      return ["100%", "100%"];
  }
};

const HeartContainer = ({
  damage,
  maxDamage,
  hearts = 5,
}: {
  damage: number;
  maxDamage: number;
  hearts?: number;
}) => {
  if (damage == null || maxDamage == null) return null;
  const healthPct = (100 * (maxDamage - damage)) / maxDamage;

  return (
    <div
      className="test"
      style={{
        paddingTop: "5px",
        height: "100%",
        color: "black",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <span>{Math.ceil(healthPct)}%</span>
      <Icon
        size="large"
        name="heart"
        style={{
          margin: "0px 3px",
          color: "transparent",
          background: `linear-gradient(to top, red ${healthPct}%, #000000aa ${healthPct}% 100%, #000000aa 100%)`,
        }}
      />
    </div>
  );
};

export default React.memo(JobController);
