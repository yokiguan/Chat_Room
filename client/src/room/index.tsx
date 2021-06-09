import {
  Button,
  Color,
  FormControl,
  Icon,
  InputAdornment,
  InputLabel,
  OutlinedInput,
} from "@material-ui/core";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import EmojiEmotionsIcon from "@material-ui/icons/EmojiEmotions";
import SendIcon from "@material-ui/icons/Send";
import "./index.less";
import { getRoomHistoryRecord, leaveRoom, logout } from "api";
import { AppContext } from "App";
import { locationParams } from "utils";
import { useHistory } from "react-router-dom";
interface Msg {
  msg: string;
  from: string;
  create_time: number;
}
interface User {
  user_id: string;
  user_name: string;
  isActive: boolean;
}
interface Data {
  users: User[];
  msgs: Msg[];
}
const Room: React.FC<{}> = () => {
  const context = useContext(AppContext);
  const [typed, setTyped] = useState("");
  const [list, setList] = useState<Msg[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const data = useRef<Data>({ users: [], msgs: [] });
  const history = useHistory();
  const isFirstRender = useRef(true);
  let renderTest = true;
  let { roomID } = locationParams();

  const handleLeaveRoom = async () => {
    await leaveRoom(roomID, context.user.user_id);
    history.push(`/home`);
    context.IO?.close();
  };
  const handleLogout = async () => {
    let {
      data: { code },
    } = await logout();
    if (code === 200) context.updateAuth(false);
  };
  const handleTyping = (e: any) => {
    setTyped(e.target.value);
  };
  const handleSendMsg = () => {
    context.IO?.emit("chatMessage", typed);
    let newMsgs = [
      ...data.current.msgs,
      { from: context.user.user_name, msg: typed, create_time: Date.now() },
    ];
    setList(newMsgs);
    data.current = { ...data.current, msgs: newMsgs };
    setTyped("");
  };

  useEffect(() => {
    if (context.user.user_id !== "") {
      let { roomID } = locationParams();

      if (renderTest) getRoomData();
    } else context.updateAuth(false);
    return () => {
      isFirstRender.current = false;
      setUsers([]);
      setList([]);
    };
  }, []);

  const getRoomData = async () => {
    renderTest = false;

    let {
      data: { code, msg, users, records },
    } = await getRoomHistoryRecord(roomID);

    if (code === 200) {
      setList(records);
      setUsers(users);
      data.current = { users, msgs: records };
    }
  };
  const handleJoin = useCallback(
    (user: User) => {
      let newUsers: User[] = [...data.current.users];
      let index = newUsers.findIndex((u) => u.user_id === user.user_id);

      if (index !== -1) newUsers[index].isActive = true;
      else
        newUsers.push({
          user_name: user.user_name,
          user_id: user.user_id,
          isActive: true,
        });
      setUsers(newUsers);

      data.current = { msgs: data.current.msgs, users: newUsers };
    },
    [users]
  );
  const handleJoinAndLeft = useCallback(() => {
    context.IO?.on("join", ({ user }: any) => {
      handleJoin(user);
    });

    context.IO?.on("left", ({ user }: any) => {
      let newUsers: User[] = [...data.current.users];
      newUsers = newUsers.filter((u) => u.user_id !== user.user_id);
      setUsers(newUsers);
      data.current = { msgs: data.current.msgs, users: newUsers };
    });
  }, [context.IO, users]);

  useEffect(() => {
    context.IO?.on("chat_message", (msg: any) => {
      if (msg.from !== context.user.user_name && context.IO) {
        let newMsgs = [...data.current.msgs, msg];
        setList(newMsgs);
        data.current = { ...data.current, msgs: newMsgs };
      }
    });
    handleJoinAndLeft();
  }, [context.IO]);

  return (
    <div className="room-page">
      <div className="room-header">
        <div className="room-header-title">
          <EmojiEmotionsIcon
            style={{ color: "white", marginRight: "10px", fontSize: "40px" }}
          />
          Chat Room
        </div>
        <Button className="btn" onClick={handleLeaveRoom}>
          Leave Room
        </Button>
        <Button className="btn" onClick={handleLogout}>
          Logout
        </Button>
      </div>
      <div className="room-main">
        <div className="room-main-sidebar">
          <div className="room-content">
            <div className="room-title">Room Name</div>
            <div className="room-name">冲他妈的！</div>
          </div>
          <div className="users-content">
            <div className="users-title">Users</div>
            <div className="users-list">
              {users.map((user) => (
                <div className="user" key={user.user_id}>
                  {user.user_name}
                  {/* {user.isActive ? "(在线)" : "(不在线)"} */}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="room-main-content">
          <div className="conversation">
            {list.map((msg) => {
              return msg.from === context.user.user_name ? (
                <div className="conversation-send" key={msg.create_time}>
                  {msg.msg}
                </div>
              ) : (
                <div className="conversation-receive" key={msg.create_time}>
                  {msg.msg}
                </div>
              );
            })}
          </div>
          <div className="typing">
            <FormControl
              fullWidth
              variant="outlined"
              size="small"
              style={{ background: "white", borderRadius: "28px" }}
            >
              <InputLabel htmlFor="send-text">Typing...</InputLabel>

              <OutlinedInput
                id="send-text"
                value={typed}
                onChange={handleTyping}
                endAdornment={
                  <InputAdornment position="end">
                    <SendIcon className="send-icon" onClick={handleSendMsg} />
                  </InputAdornment>
                }
              />
            </FormControl>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Room;
