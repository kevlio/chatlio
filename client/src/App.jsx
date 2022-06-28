import { useState, useEffect, useRef } from "react";
import "./App.css";
import { GiDogHouse } from "react-icons/gi";
import { FaUserAstronaut } from "react-icons/fa";
import { BsChatFill } from "react-icons/bs";
import { IoAddOutline } from "react-icons/io5";
import { MdSend } from "react-icons/md";

import Emoji from "react-emoji-render";

import {
  Flex,
  Input,
  Button,
  Center,
  Box,
  Text,
  useDisclosure,
  Image,
  Collapse,
  Grid,
  GridItem,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Textarea,
  CloseButton,
} from "@chakra-ui/react";

import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

function App() {
  const handleKeyDown = (e) => {
    e.target.style.height = "inherit";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const { isOpen, onToggle, onClose, onOpen } = useDisclosure();

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const [clientID, setClientID] = useState("");
  const [users, setUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);

  const [typing, setTyping] = useState("");

  const [randomColor, setRandomColor] = useState("");
  const [avatar, setAvatar] = useState("");

  const [room, setRoom] = useState("");
  const [rooms, setRooms] = useState([]);

  const [newRoom, setNewRoom] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    socket.on("connection", (data) => {
      setRooms(data.rooms);
      setUsers(data.users);
    });

    socket.on("getUsers", (data) => {
      setUsers(data);
    });

    socket.on("joined_room", (data) => {
      setRooms(data);
    });

    socket.on("active_users", (users) => {
      console.log(users);
      setActiveUsers(users);
    });

    socket.on("deleted_room", (data) => {
      setRooms(data);
      setRoom("");
      setMessages([]);
    });

    socket.on("current_room", (data) => {
      setMessages(data);
    });

    socket.on("registered", (user) => {
      console.log(user);
      setClientID(user.user_id);
      setUsername(user.username);
    });

    socket.on("errorMessage", (error) => {
      setErrorMessage(error);
    });

    socket.on("sentMessage", (data) => {
      setMessages(data);
    });

    socket.on("isTyping", (data) => {
      console.log(data);
      setTyping(data);
    });

    socket.on("disconnect", () => {
      setUsername("");
      setClientID("");
      setRooms([]);
      setMessages([]);
      setErrorMessage("");
    });

    return () => socket.off();
  }, []);

  const handleMessage = (message) => {
    socket.emit("chatMessage", {
      message,
      clientID,
      username,
      randomColor,
      avatar,
      room,
    });
    setTyping("");
  };

  // Vässa
  const handleTyping = () => {
    if (message.length)
      socket.emit("isTyping", { typing: true, user: username });

    if (!message.length) {
      socket.emit("isTyping", { typing: false, user: username });
    }
  };

  const [username, setUsername] = useState("");

  const handleUser = (username) => {
    setClientID(username);
    const random = Math.floor(Math.random() * 16777215).toString(16);
    setRandomColor(random);
    setAvatar(
      `https://avatars.dicebear.com/api/pixel-art-neutral/${username}.svg`
    );
    socket.emit("register", username);
  };

  const handleDelete = (roomName) => {
    socket.emit("delete_room", roomName);
  };

  const joinRoom = (roomName) => {
    socket.emit("join_room", { roomName, username });
  };
  // const handleLeave = (username) => {
  //   setUsername("");
  // };

  return (
    <div className="App">
      <Center display="flex">
        <Grid
          border="4px solid black"
          bg="gray.200"
          templateRows="repeat(6, 1fr)"
          templateColumns="repeat(4, 1fr)"
          m={1}
        >
          <GridItem bgColor="black" rowSpan={1} colSpan={4} px={2}>
            <Flex flexDir="column">
              <Flex
                justifyContent="space-between"
                alignItems="center"
                gap={2}
                p={2}
              >
                <Text fontSize="2xl" fontWeight="medium" color="white">
                  {clientID
                    ? `Welcome ${username}...`
                    : "Waiting for server..."}
                </Text>
                <Text color="white">{errorMessage}</Text>
                <Button
                  colorScheme="purple"
                  // alignSelf="flex-start"
                  width="min-content"
                  size="sm"
                >
                  Leave chatroom
                </Button>
              </Flex>
            </Flex>
          </GridItem>
          <GridItem
            // bg="blackAlpha.900"
            bgColor="black"
            color="white"
            rowSpan={5}
            colSpan={1}
            alignSelf="flex-start"
            px={2}
            minH="100%"
            maxH="400px"
            overflowY="scroll"
            css={{
              "&::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            <Flex flexDir="column" alignItems="flex-start">
              <Flex flexDir="column" px={1} mx={1} alignItems="flex-start">
                <Flex alignItems="center" gap={2}>
                  <FaUserAstronaut />
                  <Text fontWeight="bold">Users</Text>
                </Flex>
                <Flex>
                  <InputGroup>
                    <InputRightElement
                      onClick={() => {
                        handleUser(username);
                      }}
                      children={<IoAddOutline />}
                    />
                    <Input
                      placeholder="Join chat"
                      variant="outline"
                      maxW="150px"
                      value={username}
                      color={clientID ? "blue.300" : "white"}
                      // disabled={clientID && true}
                      fontSize="lg"
                      onChange={(e) => setUsername(e.target.value)}
                      onKeyPress={(e) => {
                        // && !clientID
                        if (e.key === "Enter") {
                          handleUser(username);
                        }
                      }}
                    />
                  </InputGroup>
                </Flex>
                {users &&
                  users.map((client) => (
                    <Text
                      mx={6}
                      key={client.username}
                      color={username === client.username && "blue.300"}
                      fontWeight={username === client.username && "bold"}
                    >
                      {client.username}
                    </Text>
                  ))}
              </Flex>
              <Flex flexDir="column" p={1} m={1}>
                <Flex alignItems="center" gap={2}>
                  <GiDogHouse />
                  <Text fontWeight="bold">Rooms</Text>
                </Flex>
                <InputGroup>
                  <InputRightElement
                    children={<IoAddOutline />}
                    onClick={() => {
                      joinRoom(room);
                      setNewRoom("");
                      onToggle();
                    }}
                  />
                  <Input
                    placeholder="Add room"
                    variant="outline"
                    maxW="150px"
                    value={newRoom}
                    fontSize="lg"
                    onChange={(e) => {
                      setNewRoom(e.target.value);
                      setRoom(e.target.value);
                    }}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        joinRoom(room);
                        setNewRoom("");
                        onToggle();
                      }
                    }}
                  />
                </InputGroup>
                {rooms &&
                  rooms.map((roomItem) => (
                    <Flex
                      color="white"
                      alignItems="center"
                      justifyContent="space-between"
                      key={room.room_id}
                      bgColor={
                        room === roomItem.room_name ? "gray.700" : "black"
                      }
                    >
                      <Button
                        m={0}
                        width="90%"
                        onClick={() => {
                          joinRoom(roomItem.room_name);
                          setRoom(roomItem.room_name);
                        }}
                        bgColor={
                          room === roomItem.room_name ? "gray.700" : "black"
                        }
                        _hover={{
                          bg: "green.400",
                        }}
                      >
                        {roomItem.room_name}
                      </Button>
                      <Box px={2}>
                        <CloseButton
                          color={room === roomItem.room_name ? "red" : "white"}
                          onClick={() => handleDelete(roomItem.room_name)}
                        />
                      </Box>
                    </Flex>
                  ))}
              </Flex>
            </Flex>
          </GridItem>
          <GridItem rowSpan={5} colSpan={3} minH="100%" bgColor="gray.800">
            <Flex flexDir="column">
              <Flex flexDir="ROW" gap={1} p={2} alignSelf="flex-end">
                {activeUsers &&
                  activeUsers.map((user) => (
                    <Text
                      key={user.username}
                      color={user.username === username ? "blue.300" : "white"}
                    >
                      {user.username}
                    </Text>
                  ))}
              </Flex>
              <Flex
                minH="100%"
                flexDir="column"
                overflowY="scroll"
                css={{
                  "&::-webkit-scrollbar": {
                    display: "none",
                  },
                }}
              >
                {messages &&
                  messages.map((message) => (
                    <Flex
                      key={message.id}
                      flexDir="row"
                      justifyContent="space-between"
                      border="1px solid purple"
                      bgColor={`#${message.randomColor}`}
                      bgGradient="revert"
                      borderRadius={6}
                      p={1}
                      overflowWrap="break-word"
                      color="white"
                    >
                      {/* <Text>{message.room_name}</Text> */}
                      <Flex flexDir="column" alignItems="center">
                        {/* <Text fontSize="10px">{message.user_id}</Text> */}
                        <Text color="blue.300">{message.time}</Text>
                        <Emoji text={message.message} />
                      </Flex>
                      <Flex gap={2} alignItems="center">
                        <Text>{message.username}</Text>
                        <Image
                          src={message.avatar}
                          boxSize={10}
                          rounded="full"
                        />
                      </Flex>
                    </Flex>
                  ))}
                <Box ref={scrollRef}></Box>
                <Text
                  color="gray.300"
                  alignSelf="center"
                  borderTop="5px solid #1A202C"
                >
                  {typing}
                </Text>
                <Flex
                  flexDir="row"
                  alignItems="flex-end"
                  bgColor="#1A202C"
                  border="20px solid #1A202C"
                  borderTop="5px solid #1A202C"
                >
                  <Textarea
                    width="100%"
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    variant="outline"
                    bg="gray.700"
                    color="white"
                    value={message}
                    fontSize="lg"
                    border="none"
                    borderRadius="none"
                    _focus={{
                      border: "1px solid black",
                    }}
                    onChange={(e) => {
                      setMessage(e.target.value);
                    }}
                    onKeyPress={(e) => {
                      if (e.key !== "Enter") {
                        handleTyping();
                      }
                      if (e.key === "Enter") {
                        handleMessage(message);
                        setMessage("");
                      }
                    }}
                  />
                  <Box p={1}>
                    <MdSend
                      onMouseOver={({ target }) =>
                        (target.style.color = "#25D366")
                      }
                      onMouseOut={({ target }) =>
                        (target.style.color = "#48BB78")
                      }
                      // color="#25D366"
                      size={40}
                      onClick={() => {
                        handleMessage(message);
                        setMessage("");
                      }}
                    />
                  </Box>
                </Flex>
              </Flex>
            </Flex>
          </GridItem>
        </Grid>
      </Center>
    </div>
  );
}

export default App;
