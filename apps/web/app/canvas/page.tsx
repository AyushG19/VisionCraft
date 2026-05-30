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
import { DrawElement, QueryType } from "@repo/common";
import { convertAllElements } from "./utils/elementsConverter";
import { createDraggedGroup } from "./utils/createTempShapeHelper";

const elemnts: DrawElement[] = [
  {
    id: "start-node",
    type: "rectangle",
    startX: 400,
    startY: 100,
    endX: 600,
    endY: 180,
    strokeWidth: 2,
    strokeColor: { l: 20, c: 0, h: 0, a: 1 },
    backgroundColor: { l: 90, c: 10, h: 200, a: 1 },
    isDeleted: false,
    isSelected: false,
    opacity: 1,
    strokeType: "normal",
    label: {
      text: "User Requests Book",
      fontSize: 12,
      fontFamily: "google sans code",
    },
  },
  {
    id: "arrow-1",
    type: "arrow",
    startX: 500,
    startY: 180,
    points: [
      { x: 0, y: 0 },
      { x: 0, y: 50 },
      { x: 0, y: 100 },
    ],
    strokeWidth: 2,
    strokeColor: { l: 40, c: 20, h: 200, a: 1 },
    backgroundColor: null,
    isDeleted: false,
    isSelected: false,
    opacity: 1,
    strokeType: "normal",
  },
  {
    id: "decision-found",
    type: "diamond",
    startX: 400,
    startY: 280,
    endX: 600,
    endY: 360,
    strokeWidth: 2,
    strokeColor: { l: 40, c: 50, h: 300, a: 1 },
    backgroundColor: { l: 95, c: 10, h: 300, a: 1 },
    isDeleted: false,
    isSelected: false,
    opacity: 1,
    strokeType: "normal",
    label: {
      text: "Book Found?",
      fontSize: 11,
      fontFamily: "google sans code",
    },
  },
  {
    id: "arrow-no-found",
    type: "arrow",
    startX: 600,
    startY: 320,
    points: [
      { x: 0, y: 0 },
      { x: 50, y: 0 },
      { x: 100, y: 0 },
    ],
    strokeWidth: 2,
    strokeColor: { l: 40, c: 60, h: 20, a: 1 },
    backgroundColor: null,
    isDeleted: false,
    isSelected: false,
    opacity: 1,
    strokeType: "dash",
  },
  {
    id: "node-order",
    type: "rectangle",
    startX: 700,
    startY: 280,
    endX: 900,
    endY: 360,
    strokeWidth: 2,
    strokeColor: { l: 40, c: 60, h: 20, a: 1 },
    backgroundColor: { l: 95, c: 10, h: 20, a: 1 },
    isDeleted: false,
    isSelected: false,
    opacity: 1,
    strokeType: "normal",
    label: {
      text: "Order from Vendor",
      fontSize: 12,
      fontFamily: "google sans code",
    },
  },
  {
    id: "arrow-yes-found",
    type: "arrow",
    startX: 500,
    startY: 360,
    points: [
      { x: 0, y: 0 },
      { x: 0, y: 50 },
      { x: 0, y: 100 },
    ],
    strokeWidth: 2,
    strokeColor: { l: 40, c: 50, h: 150, a: 1 },
    backgroundColor: null,
    isDeleted: false,
    isSelected: false,
    opacity: 1,
    strokeType: "normal",
  },
  {
    id: "decision-member",
    type: "diamond",
    startX: 400,
    startY: 460,
    endX: 600,
    endY: 540,
    strokeWidth: 2,
    strokeColor: { l: 40, c: 50, h: 300, a: 1 },
    backgroundColor: { l: 95, c: 10, h: 300, a: 1 },
    isDeleted: false,
    isSelected: false,
    opacity: 1,
    strokeType: "normal",
    label: {
      text: "Valid Member?",
      fontSize: 11,
      fontFamily: "google sans code",
    },
  },
  {
    id: "arrow-no-member",
    type: "arrow",
    startX: 400,
    startY: 500,
    points: [
      { x: 0, y: 0 },
      { x: -50, y: 0 },
      { x: -100, y: 0 },
    ],
    strokeWidth: 2,
    strokeColor: { l: 40, c: 60, h: 20, a: 1 },
    backgroundColor: null,
    isDeleted: false,
    isSelected: false,
    opacity: 1,
    strokeType: "dotted",
  },
  {
    id: "node-register",
    type: "rectangle",
    startX: 100,
    startY: 460,
    endX: 300,
    endY: 540,
    strokeWidth: 2,
    strokeColor: { l: 40, c: 40, h: 250, a: 1 },
    backgroundColor: { l: 90, c: 5, h: 250, a: 1 },
    isDeleted: false,
    isSelected: false,
    opacity: 1,
    strokeType: "normal",
    label: {
      text: "Register New User",
      fontSize: 12,
      fontFamily: "google sans code",
    },
  },
  {
    id: "arrow-yes-member",
    type: "arrow",
    startX: 500,
    startY: 540,
    points: [
      { x: 0, y: 0 },
      { x: 0, y: 50 },
      { x: 0, y: 100 },
    ],
    strokeWidth: 2,
    strokeColor: { l: 40, c: 50, h: 150, a: 1 },
    backgroundColor: null,
    isDeleted: false,
    isSelected: false,
    opacity: 1,
    strokeType: "normal",
  },
  {
    id: "node-issue",
    type: "rectangle",
    startX: 400,
    startY: 640,
    endX: 600,
    endY: 720,
    strokeWidth: 2,
    strokeColor: { l: 30, c: 60, h: 140, a: 1 },
    backgroundColor: { l: 95, c: 20, h: 140, a: 1 },
    isDeleted: false,
    isSelected: false,
    opacity: 1,
    strokeType: "normal",
    label: {
      text: "Issue & Update DB",
      fontSize: 12,
      fontFamily: "google sans code",
    },
  },
  {
    id: "loop-arrow",
    type: "arrow",
    startX: 600,
    startY: 680,
    points: [
      { x: 0, y: 0 },
      { x: 350, y: 0 },
      { x: 350, y: -540 },
    ],
    strokeWidth: 2,
    strokeColor: { l: 50, c: 10, h: 220, a: 1 },
    backgroundColor: null,
    isDeleted: false,
    isSelected: false,
    opacity: 1,
    strokeType: "dash",
    label: {
      text: "Repeat Process",
      fontSize: 10,
      fontFamily: "handlee",
    },
  },
];
const Page = () => {
  const [popupVisible, setPopupVisible] = useState<boolean>(false);
  const { theme, setTheme } = useTheme();
  const { setToast } = useToast();
  const { currentUser, setCurrentUser } = useUser();
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

  // useOnboardingOverlay(wb.canvasRef);

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
      {/*<Button
        className="z-1000 absolute left-100 top-100"
        onClick={() => (wb.selectedElementsRef.current = elemnts)}
      >
        click
      </Button>*/}
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
          fetchFromAi={sendReqToAi}
          isOpen={wb.isOpen}
          isLoading={aiLoading}
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
    </div>
  );
};

export default Page;
