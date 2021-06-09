import axios, { AxiosResponse } from "axios";
const service = axios.create({
  baseURL: "http://127.0.0.1:3001", // api的base_url
  timeout: 5000, // 请求超时时间
  withCredentials: true,
  // crossDomain: true,
});

export const login: ({
  username,
  password,
}: {
  username: string;
  password: string;
}) => Promise<AxiosResponse<any>> = async ({ username, password }) =>
  await service.post("/login", { username, password });

export const verify: () => Promise<AxiosResponse<any>> = async () =>
  await service.post("/verify", {});

export const logout: () => Promise<AxiosResponse<any>> = async () =>
  await service.post("/logout", {});

export const register: ({
  username,
  password,
}: {
  username: string;
  password: string;
}) => Promise<AxiosResponse<any>> = async ({ username, password }) =>
  await service.post("/register", { username, password });

export const getRoomHistoryRecord: (
  room_id: string
) => Promise<AxiosResponse<any>> = async (room_id) =>
  await service.post("/history_record", { room_id });

export const leaveRoom: (
  room_id: string,
  user_id: string
) => Promise<AxiosResponse<any>> = async (room_id, user_id) =>
  await service.post("/leave_room", { room_id, user_id });

export const getRooms: () => Promise<AxiosResponse<any>> = async () =>
  await service.get("/rooms");

export const createRoom: (room_name: string) => Promise<AxiosResponse<any>> =
  async (room_name: string) => await service.post("/rooms", { room_name });
