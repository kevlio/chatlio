import { useState, useEffect, useRef } from "react";
import "./App.css";
import { GiDogHouse } from "react-icons/gi";
import { FaUserAstronaut } from "react-icons/fa";
import { BsChatFill } from "react-icons/bs";
import { IoAddOutline } from "react-icons/io5";
import { RiDeleteBack2Fill } from "react-icons/ri";

import {
  Flex,
  Avatar,
  Input,
  Container,
  StatGroup,
  Stat,
  StatLabel,
  StatHelpText,
  StatArrow,
  Icon,
  Button,
  Center,
  Box,
  Stack,
  Heading,
  Text,
  FormControl,
  Fade,
  useDisclosure,
  SimpleGrid,
  Image,
  Link,
  createIcon,
  Collapse,
  Grid,
  GridItem,
  Checkbox,
  CheckboxGroup,
  InputGroup,
  InputLeftElement,
  InputRightElement,
} from "@chakra-ui/react";

import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

function App() {
  const { isOpen, onToggle, onClose, onOpen } = useDisclosure();

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const [clientID, setClientID] = useState("");
  const [clients, setClients] = useState([]);

  const [randomColor, setRandomColor] = useState("");
  const [avatar, setAvatar] = useState("");

  const [room, setRoom] = useState("");
  const [rooms, setRooms] = useState([]);

  const [roomAdd, setRoomAdd] = useState("");

  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    socket.on("connection", (data) => {
      console.log("Connected to server");
      console.log(data);
      // setRooms(data);
    });

    socket.on("joined_room", (data) => {
      console.log(data);
      setRooms(data);
    });

    socket.on("deleted_room", (data) => {
      console.log(data);
      setRooms(data);
    });

    socket.on("current_room", (data) => {
      console.log(data);
      setMessages(data.messages);
    });

    socket.on("message", (data) => {
      console.log(data);
    });

    socket.on("getAllClients", (data) => {
      console.log(data);
      setClients(data);
    });

    socket.on("clientID", (data) => {
      console.log(data);
      setClientID(data);
      const random = Math.floor(Math.random() * 16777215).toString(16);
      setRandomColor(random);
      setAvatar(
        `https://avatars.dicebear.com/api/pixel-art-neutral/${data}.svg`
      );
    });

    socket.on("sentMessage", (data) => {
      setRoom(data.room);
      setMessages(data.messages);
    });

    socket.on("disconnect", () => {
      setRooms([]);
      setMessages([]);
    });

    return () => socket.off();
  }, []);

  const handleMessage = (message) => {
    console.log(room);
    socket.emit("chatMessage", {
      message,
      clientID,
      randomColor,
      avatar,
      room,
    });
  };

  const handleDelete = (roomName) => {
    console.log(roomName);
    socket.emit("delete_room", roomName);
  };

  const joinRoom = (roomName) => {
    console.log(roomName);
    socket.emit("join_room", roomName);
  };

  return (
    <div className="App">
      <Center display="flex" my={10}>
        <Grid
          // h="200px"
          templateRows="repeat(6, 1fr)"
          templateColumns="repeat(3, 1fr)"
          // gap={4}
          border="3px solid black"
          borderRadius={10}
          p={1}
          m={1}
        >
          <GridItem
            rowSpan={1}
            colSpan={3}
            // borderBottom="1px solid black"
            borderRadius={10}
            p={1}
            m={1}
          >
            <Flex flexDir="column">
              <Flex justifyContent="space-between" alignItems="center" gap={2}>
                <Text fontSize="2xl" fontWeight="bold" color="green.400">
                  {clientID
                    ? `Welcome ${clientID.slice(0, 10)}...`
                    : "Waiting for server..."}
                </Text>
                <Button
                  colorScheme="purple"
                  alignSelf="flex-start"
                  width="min-content"
                  size="sm"
                >
                  Leave chatroom
                </Button>
              </Flex>
              <Checkbox size="sm">
                Dont allow new users to see previous texts
              </Checkbox>
              {/* onChange={handleCheck} */}
            </Flex>
          </GridItem>
          <GridItem
            // bg="blackAlpha.900"
            color="blackAlpha.900"
            rowSpan={5}
            colSpan={1}
            alignSelf="flex-start"
            // borderRight="2px solid black"
            borderRadius={10}
            p={2}
            minH="100%"
            maxH="400px"
            overflow="hidden"
          >
            <Flex flexDir="column" alignItems="flex-start">
              <Flex flexDir="column" p={1} m={1}>
                <Button
                  // isDisabled
                  m={0}
                  p={0}
                  bg="none"
                  fontSize="1xl"
                  fontWeight="bold"
                  leftIcon={<GiDogHouse />}
                >
                  Rooms
                </Button>
                <Button
                  // isDisabled
                  m={0}
                  p={0}
                  bg="none"
                  fontSize="1xl"
                  // leftIcon={<IoAddOutline />}
                  onClick={() => onToggle()}
                >
                  Add room
                </Button>
                <Collapse in={isOpen}>
                  <InputGroup>
                    <InputRightElement
                      children={<IoAddOutline />}
                      onClick={() => {
                        joinRoom(room);
                        setRoomAdd("");
                      }}
                    />
                    <Input
                      variant="outline"
                      maxW="150px"
                      value={roomAdd}
                      fontSize="lg"
                      onChange={(e) => {
                        setRoomAdd(e.target.value);
                        setRoom(e.target.value);
                      }}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          joinRoom(room);
                          setRoomAdd("");
                        }
                      }}
                    />
                  </InputGroup>
                </Collapse>
                {rooms &&
                  rooms.reverse().map((roomName) => (
                    <Flex
                      alignItems="center"
                      justifyContent="space-between"
                      key={roomName}
                    >
                      <Text
                        bgColor={room === roomName && "green"}
                        onClick={() => {
                          joinRoom(roomName);
                          setRoom(roomName);
                        }}
                      >
                        {roomName}
                      </Text>
                      <RiDeleteBack2Fill
                        color="red"
                        onClick={() => handleDelete(roomName)}
                      />
                    </Flex>
                  ))}
              </Flex>
              <Flex flexDir="column" p={1} m={1} alignItems="flex-start">
                <Button
                  // isDisabled
                  m={0}
                  p={0}
                  bg="none"
                  fontSize="1xl"
                  fontWeight="bold"
                  leftIcon={<FaUserAstronaut />}
                >
                  Users
                </Button>
                {clients &&
                  clients
                    .reverse()
                    .map((client) => (
                      <Text bgColor={clientID === client && "green"}>
                        {client.slice(0, 5)}
                      </Text>
                    ))}
              </Flex>
            </Flex>
          </GridItem>
          <GridItem
            rowSpan={5}
            colSpan={2}
            alignSelf="flex-end"
            // borderRight="2px solid black"
            border="1px solid black"
            borderRadius={10}
            p={2}
          >
            <Flex flexDir="column">
              <Flex
                minH="100%"
                flexDir="column"
                maxH="400px"
                maxW="400px"
                overflowY="scroll"
                css={{
                  "&::-webkit-scrollbar": {
                    display: "none",
                  },
                }}
                gap={1}
              >
                {messages &&
                  messages.map((message) => (
                    <Flex
                      flexDir="row"
                      justifyContent="space-between"
                      border="1px solid purple"
                      bgColor={`#${message.randomColor}`}
                      bgGradient="revert"
                      borderRadius={6}
                      p={1}
                      overflowWrap="break-word"
                    >
                      <Text>{message.roomAdd}</Text>
                      <Flex flexDir="column">
                        <Text fontSize="10px">{message.clientID}</Text>
                        <Text color="white">{message.message}</Text>
                      </Flex>
                      <Image src={message.avatar} boxSize={10} rounded="full" />
                    </Flex>
                  ))}
                <Box ref={scrollRef}></Box>
                <InputGroup>
                  <InputLeftElement children={<BsChatFill />} />
                  <Input
                    placeholder="Write message..."
                    variant="outline"
                    bg="gray.100"
                    value={message}
                    fontSize="lg"
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleMessage(message);
                        setMessage("");
                      }
                    }}
                  />
                </InputGroup>
                <Button
                  minH={10}
                  colorScheme="green"
                  onClick={() => {
                    handleMessage(message);
                    setMessage("");
                  }}
                >
                  Send Message
                </Button>
              </Flex>
            </Flex>
          </GridItem>
        </Grid>
      </Center>
    </div>
  );
}

export default App;
