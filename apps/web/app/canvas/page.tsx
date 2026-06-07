"use client";
import { Toolkit, toolkitProps, TextArea, JoinRoomModal, Zoom } from "@repo/ui";

import dynamic from "next/dynamic";

const SideCollapseChat = dynamic(
  () =>
    import("@repo/ui/components/SideCollapseChat").then((mod) => mod.default),
  {
    ssr: false,
  },
);
const SideToolkit = dynamic(
  () => import("@repo/ui").then((mod) => mod.SideToolkit),
  { ssr: false },
);
const CanvasPopup = dynamic(
  () => import("@repo/ui").then((mod) => mod.CanvasPopup),
  { ssr: false },
);
const DynamicCanvas = dynamic(
  () => import("@repo/ui").then((mod) => mod.DynamicCanvas),
  { ssr: false },
);
const Toast = dynamic(() => import("@repo/ui").then((mod) => mod.Toast), {
  ssr: false,
});
import { useSocketWithWhiteboard } from "./hooks/useSocketWithWhiteboard";
import useAi from "./hooks/useAi";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { logout } from "../services/auth.service";
import UsersCursor from "@repo/ui/components/ui/UsersCursor";
import { useToast, useUser } from "@repo/hooks";
import { getProfile } from "../services/user.service";
import { drawShape } from "./utils/drawing";
import { getGroupOutlineBounds } from "./utils/getBoundsHelpers";
import { QueryType } from "@repo/common";
import { exportFunction } from "./helper/propFunction.helper";

const Page = () => {
  const [popupVisible, setPopupVisible] = useState<boolean>(false);
  const toolkitRef = useRef<HTMLDivElement | null>(null);
  const { theme, setTheme } = useTheme();
  const { currentUser, setCurrentUser } = useUser();
  const { setToast } = useToast();
  const wb = useSocketWithWhiteboard();

  const {
    loading: aiLoading,
    handleChatRequest,
    handleDrawRequest,
    result: aiResult,
  } = useAi(wb.selectedElementsRef, wb.cameraRef.current);

  const sendReqToAi = async (
    command: string,
    queryType: QueryType,
  ): Promise<void> => {
    switch (queryType) {
      case "add":
      case "edit":
      case "create": {
        return handleDrawRequest(
          command,
          wb.ConvertAndCenterGroupToScreenMiddle,
          wb.updateMessage,
          queryType,
          wb.canvasState.textState.fontSize,
        );
      }
      case "tell": {
        return handleChatRequest(command, wb.updateMessage, queryType);
      }
    }
  };

  const handleChatToggle = () => {
    wb.setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    console.log("copy result:", aiResult);

    if (aiResult.length === 0) return;
    setPopupVisible(true);
  }, [aiResult]);

  useEffect(() => {
    async function getUserProfile() {
      try {
        const user = await getProfile();
        setCurrentUser({ avatar: "", ...user });
      } catch (err: any) {
        console.warn("Profile fetch failed.");
      }
    }
    getUserProfile();
  }, []);

  const exportCanvas = () => {
    const canvas = wb.canvasRef.current;
    if (canvas) {
      setToast({
        message: "Started Download.",
        title: "Downloading...",
        type: "info",
      });
      exportFunction(wb.canvasState.drawnShapes).then((res) => {
        setToast({
          message: "Finished your download.",
          title: "Downloaded.",
          type: "success",
        });
      });
    }
  };

  const toolkitProps: toolkitProps = {
    handleColorSelect: wb.handleColorSelect,
    currentColor: wb.canvasState.toolState.currentColor,
    handleToolSelect: wb.handleToolSelect,
    toolKitState: wb.canvasState.toolState,
    handleRedo: wb.handleRedo,
    handleUndo: wb.handleUndo,
    inputRef: wb.inputRef,
    toolkitRef,
  };

  return (
    <main className={`relative h-dvh w-dvw overflow-hidden touch-none`}>
      <Toolkit {...toolkitProps} />
      {wb.textEdit && (
        <TextArea
          textAreaRef={wb.textAreaRef}
          cancelText={wb.cancelText}
          finishText={wb.finishText}
          setTextEdit={wb.setTextEdit}
          textEditorState={wb.canvasState.textState}
          textEditState={wb.textEdit}
          toolKitState={wb.canvasState.toolState}
        />
      )}
      <canvas
        ref={wb.canvasRef}
        className="bg-canvas touch-none w-dvw h-dvh "
      ></canvas>
      <Zoom zoomDisplay={wb.zoomDisplay} changeZoom={wb.changeZoom} />
      {wb.inRoom &&
        wb.users.map(
          (u) =>
            u.userId !== currentUser?.userId && (
              <UsersCursor key={u.userId} {...u} />
            ),
        )}
      {wb.selectedElementForUI && (
        <SideToolkit
          selectedShape={wb.selectedElementForUI}
          tool={wb.canvasState.toolState.currentTool}
          onChange={() => {}}
          onDelete={() => {}}
          panelRef={wb.sideToolkitRef}
          theme={theme}
          setTheme={setTheme}
          editorState={wb.canvasState.sideToolKitState}
          setEditorState={wb.setEditorState}
          textState={wb.canvasState.textState}
          setTextState={wb.setTextState}
          shapeEditHelpers={{
            handleColorSelect: wb.handleColorSelect,
            handleStrokeSelect: wb.handleStrokeSelect,
            handleElementDelete: wb.handleElementDelete,
            handleStrokeStyle: wb.handleStrokeStyle,
            handleFillSelect: wb.handleFillSelect,
            handleFontSize: wb.handleFontSize,
            handleFontFamily: wb.handleFontFamily,
          }}
        ></SideToolkit>
      )}

      <>
        <JoinRoomModal
          makeNewRoom={wb.handleCreateRoom}
          verifyJoin={wb.handleJoinRoom}
          onChatToggle={handleChatToggle}
          isChatOpen={wb.isOpen}
          setTheme={setTheme}
          exportCanvas={exportCanvas}
          onExitRoom={wb.handleLeaveRoom}
          onLogout={logout}
          clearCanvas={wb.clearCanvas}
        />

        <SideCollapseChat
          inRoom={wb.inRoom}
          send={wb.send}
          messages={wb.messages}
          setMessages={wb.setMessages}
          fetchFromAi={sendReqToAi}
          isOpen={wb.isOpen}
          isLoading={aiLoading}
          slug={wb.slug}
          handleChatToggle={handleChatToggle}
        />
      </>
      {popupVisible && (
        <CanvasPopup
          isOpen={popupVisible}
          onClose={() => {
            setPopupVisible(false);
          }}
          onAccept={() => {
            wb.selectedElementsRef.current = aiResult;
            setPopupVisible(false);
          }}
        >
          <DynamicCanvas
            elements={aiResult}
            draw={drawShape}
            getSize={getGroupOutlineBounds}
          />
        </CanvasPopup>
      )}
      <Toast />
    </main>
  );
};

export default Page;
