"use client";
import {
  JoinRoomModal,
  Toolkit,
  toolkitProps,
  SideCollapseChat,
  SideToolkit,
  TextArea,
  CanvasPopup,
  DynamicCanvas,
  Button,
  Toast,
} from "@repo/ui";
import { useSocketWithWhiteboard } from "./hooks/useSocketWithWhiteboard";
import useAi from "./hooks/useAi";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { logout } from "../services/auth.service";
import UsersCursor from "@workspace/ui/components/ui/UsersCursor";
import { useError, useToast, useUser } from "@repo/hooks";
import { getProfile } from "../services/user.service";
import { drawShape } from "./utils/drawing";
import { getGroupOutlineBounds } from "./utils/getBoundsHelpers";
import { ExcalidrawElementSkeleton } from "@workspace/ui/components/types";
import { AIResultType } from "./types";
import { DrawElement } from "@repo/common";
import { convertAllElements } from "./utils/elementsConverter";
import { createDraggedGroup } from "./utils/createTempShapeHelper";

const Page = () => {
  const [popupVisible, setPopupVisible] = useState<boolean>(false);
  const { theme, setTheme } = useTheme();
  const { setToast } = useToast();
  const { currentUser, setCurrentUser } = useUser();
  const wb = useSocketWithWhiteboard();

  const { loading, result, handleDrawRequest } = useAi(
    wb.canvasRef,
    wb.canvasDispatch,
    wb.cameraRef.current,
  );

  const sendReqToAi = async (command: string): Promise<string> => {
    const ctx = wb.canvasRef.current?.getContext("2d");
    if (!ctx) {
      console.error("no ctx");
      return new Promise((res, rej) => res("no ctx"));
    }

    await handleDrawRequest(
      ctx,
      wb.canvasState.textState.fontFamily,
      command,
      wb.ConvertAndCenterGroupToScreenMiddle,
    );
    return "here is the result";
  };

  const handleChatToggle = () => {
    wb.setIsOpen((prev) => !prev);
  };

  // useOnboardingOverlay(wb.canvasRef);

  useEffect(() => {
    if (!wb.canvasRef.current) return;
    const ctx = wb.canvasRef.current.getContext("2d");
    if (!ctx) {
      console.error("canvas element not available");
      return;
    }
    console.log("copy result:", result);

    // result.forEach((shape: DrawElement) => {
    //   if (wb.inRoom) {
    //     wb.dispatchWithSocket({ type: "ADD_SHAPE", payload: shape });
    //   } else {
    //     // drawShape(ctx, shape);
    //     // const screenPos = worldToScreen(shape.startX, shape.startY, camera);
    //     // const newShape = { ...shape, startX: screenPos.x, startY: screenPos.y };
    //     wb.canvasDispatch({ type: "ADD_SHAPE", payload: shape });
    //   }
    // });
    if (result.length === 0) return;
    setPopupVisible(true);
  }, [result]);

  useEffect(() => {
    async function getUserProfile() {
      try {
        const user = await getProfile();
        setCurrentUser({ avatar: "", ...user });
      } catch (err: any) {
        setToast({
          title: "server error!",
          message: err.message ?? "Error from server",
          type: "error",
        });
      }
    }
    getUserProfile();
  }, []);

  const toolkitProps: toolkitProps = {
    handleColorSelect: wb.handleColorSelect,
    currentColor: wb.canvasState.toolState.currentColor,
    handleToolSelect: wb.handleToolSelect,
    toolKitState: wb.canvasState.toolState,
    handleRedo: wb.handleRedo,
    handleUndo: wb.handleUndo,
    inputRef: wb.inputRef,
  };

  return (
    <div className={`relative h-dvh w-dvw overflow-hidden touch-none`}>
      <Button
        className="z-1000 absolute left-100 top-100"
        onClick={() => setPopupVisible(true)}
      >
        click
      </Button>
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
      <Toast />
      <canvas
        ref={wb.canvasRef}
        className="w-full h-full bg-canvas touch-none "
      ></canvas>
      {wb.users.map(
        (u) =>
          u.userId !== currentUser?.userId && (
            <UsersCursor key={u.userId} {...u} />
          ),
      )}
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

      <>
        <JoinRoomModal
          makeNewRoom={wb.handleCreateRoom}
          verifyJoin={wb.handleJoinRoom}
          onChatToggle={handleChatToggle}
          isChatOpen={wb.isOpen}
          setTheme={setTheme}
          onExitRoom={wb.handleLeaveRoom}
          onLogout={logout}
          clearCanvas={wb.clearCanvas}
        />

        <SideCollapseChat
          inRoom={wb.inRoom}
          send={wb.send}
          messages={wb.messages}
          setMessages={wb.setMessages}
          fetchChartFromAi={sendReqToAi}
          isOpen={wb.isOpen}
          isLoading={loading}
          slug={wb.slug}
          handleChatToggle={handleChatToggle}
        />
      </>
      <Toast />
      <CanvasPopup
        isOpen={popupVisible}
        onClose={() => {
          setPopupVisible(false);
        }}
        onAccept={() => {
          wb.selectedElementsRef.current = result;
        }}
      >
        <DynamicCanvas
          elements={result}
          draw={drawShape}
          getSize={getGroupOutlineBounds}
        />
      </CanvasPopup>
    </div>
  );
};

export default Page;
