"use client";
import {
  JoinRoomModal,
  Toolkit,
  toolkitProps,
  SideCollapseChat,
  SideToolkit,
  TextArea,
} from "@repo/ui";
import { useSocketWithWhiteboard } from "./hooks/useSocketWithWhiteboard";
import useAi from "./hooks/useAi";
import { ErrorModal } from "@workspace/ui/components/ErrorModal";
import { useTheme } from "next-themes";
import { DrawElement } from "@repo/common";
import { useEffect } from "react";
// import { useUser } from "@repo/hooks";
import { useOnboardingOverlay } from "./hooks/useOnboardingOverlay";
import { logout } from "app/services/auth.service";
import UsersCursor from "@workspace/ui/components/ui/UsersCursor";
import { useUser } from "@repo/hooks";

const Page = () => {
  const { theme, setTheme } = useTheme();
  // useRafLoop({ cursorMap: memberCursor.current });
  const { currentUser } = useUser();
  const wb = useSocketWithWhiteboard();

  const { loading, result, handleDrawRequest } = useAi(
    wb.canvasRef,
    wb.canvasDispatch,
    wb.camera,
  );

  const sendReqToAi = (command: string) => {
    const ctx = wb.canvasRef.current?.getContext("2d");
    if (!ctx) {
      console.error("no ctx");
      return;
    }
    handleDrawRequest(ctx, wb.canvasState.textState.fontFamily, command);
  };

  const handleChatToggle = () => {
    wb.setIsOpen((prev) => !prev);
  };

  useOnboardingOverlay(wb.canvasRef);

  useEffect(() => {
    if (!wb.canvasRef.current) return;
    const ctx = wb.canvasRef.current.getContext("2d");
    if (!ctx) {
      console.error("canvas element not available");
      return;
    }
    console.log(typeof result);
    result.forEach((shape: DrawElement) => {
      if (wb.inRoom) {
        wb.dispatchWithSocket({ type: "ADD_SHAPE", payload: shape });
      } else {
        // drawShape(ctx, shape);
        // const screenPos = worldToScreen(shape.startX, shape.startY, camera);
        // const newShape = { ...shape, startX: screenPos.x, startY: screenPos.y };
        wb.canvasDispatch({ type: "ADD_SHAPE", payload: shape });
      }
    });
  }, [result]);

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
        className="w-full h-full bg-canvas touch-none "
      ></canvas>
      {wb.users.map(
        (u) =>
          u.userId !== currentUser?.userId && (
            <UsersCursor key={u.userId} {...u} />
          ),
      )}
      <SideToolkit
        selectedShape={wb.selectedShape}
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

      {/* {wb.inRoom ? (
        <>
          <RoomOptions
            onChatToggle={handleChatToggle}
            isChatOpen={wb.isOpen}
            handleLeaveRoom={wb.handleLeaveRoom}
          />
          {wb.users.map(
            (u) =>
              u.userId !== currentUser?.userId && (
                <UsersCursor key={u.userId} {...u} />
              ),
          )}
          <SideCollapseChat
            inRoom={wb.inRoom}
            send={wb.send}
            messages={wb.messages}
            setMessages={wb.setMessages}
            fetchChartFromAi={sendReqToAi}
            isOpen={wb.isOpen}
            isLoading={loading}
            slug={wb.slug}
          />
        </>
      ) : ( */}
      <>
        <JoinRoomModal
          makeNewRoom={wb.handleCreateRoom}
          verifyJoin={wb.handleJoinRoom}
          onChatToggle={handleChatToggle}
          isChatOpen={wb.isOpen}
          setTheme={setTheme}
          onExitRoom={wb.handleLeaveRoom}
          onLogout={logout}
          inRoom={wb.inRoom}
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
      {/* )} */}
      <ErrorModal />
    </div>
  );
};

export default Page;
