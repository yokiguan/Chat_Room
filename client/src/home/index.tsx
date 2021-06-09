import {
  Button,
  Color,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Icon,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Tabs,
  TextField,
} from "@material-ui/core";
import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "App";
import EmojiEmotionsIcon from "@material-ui/icons/EmojiEmotions";
import { createRoom, getRooms, logout } from "api";
import "./index.less";
import { useHistory } from "react-router-dom";
import socketio from "socket.io-client";

interface Room {
  room_id: string;
  room_name: string;
}
const Home: React.FC<{}> = () => {
  const context = useContext(AppContext);
  const [open, setOpen] = useState(false);
  const [room, setRoom] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const history = useHistory();
  const handleCraeteRoom = () => {
    setOpen(true);
  };
  const handleLogout = async () => {
    let {
      data: { code },
    } = await logout();
    if (code === 200) context.updateAuth(false);
  };
  const handleConfirm = async () => {
    let {
      data: { code, room: newRoom },
    } = await createRoom(room);
    if (code === 200) setRooms([...rooms, newRoom]);
    setOpen(false);
    setRoom("");
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    let {
      data: { rooms },
    } = await getRooms();
    setRooms(rooms);
  };
  const handleEnterRoom = async (room: Room) => {
    let socket = socketio(
      `http://localhost:3000/${room.room_id}?user_id=${context.user.user_id}`
    );

    context.updateIO(socket);
    setTimeout(() => {
      history.push(`/room?roomID=${room.room_id}`);
    });
  };
  return (
    <div className="home-page">
      <div className="home-header">
        <div className="home-header-title">
          <EmojiEmotionsIcon
            style={{ color: "white", marginRight: "10px", fontSize: "40px" }}
          />
          Chat Room
        </div>
        <Button className="btn" onClick={handleCraeteRoom}>
          Create Room
        </Button>
        <Button className="btn" onClick={handleLogout}>
          Logout
        </Button>
      </div>
      <div className="home-main">
        {rooms.map((r) => (
          <div
            className="room"
            key={r.room_id}
            onClick={() => {
              handleEnterRoom(r);
            }}
          >
            {r.room_name}
          </div>
        ))}
      </div>
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          setRoom("");
        }}
        className="add-dialog"
        maxWidth="sm"
        fullWidth
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Create Room</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            style={{ width: "80%", margin: "20px 10%" }}
            margin="dense"
            label="Room Name"
            fullWidth
            value={room}
            onChange={(e) => {
              setRoom(e.target.value);
            }}
          />
        </DialogContent>
        <div
          className="btn-group"
          style={{
            display: "flex",
            justifyContent: "space-around",
            margin: "30px 0px 40px",
          }}
        >
          <Button onClick={handleConfirm} color="primary">
            Confirm
          </Button>
          <Button
            onClick={() => {
              setOpen(false);
              setRoom("");
            }}
            color="primary"
          >
            Cancel
          </Button>
        </div>
      </Dialog>
    </div>
  );
};
export default Home;
