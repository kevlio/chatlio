import { useState, useEffect, useRef } from "react";
import "./App.css";
import { GiDogHouse } from "react-icons/gi";
import { FaUserAstronaut } from "react-icons/fa";
import { BsChatFill } from "react-icons/bs";
import { IoAddOutline } from "react-icons/io5";

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

let socket;

function App() {
  const { isOpen, onToggle, onClose, onOpen } = useDisclosure();

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const [clientID, setClientID] = useState("");
  const [clients, setClients] = useState([]);

  const [randomColor, setRandomColor] = useState("");
  const [avatar, setAvatar] = useState("");

  const [currentRoom, setCurrentRoom] = useState("");
  const [rooms, setRooms] = useState([]);

  const scrollRef = useRef(null);

  console.log(currentRoom);
  console.log(rooms);

  useEffect(() => {
    scrollRef.current.scrollIntoView({
      behavior: "smooth",
      // block: "end",
      // inline: "nearest",
    });
  }, [messages]);

  useEffect(() => {
    socket = io("http://localhost:4000");

    socket.on("connection", () => {
      console.log("Connected to server");
    });

    socket.on("joined_room", (data) => {
      console.log(data);
      setRooms(data);
    });

    socket.on("added_room", (data) => {
      setRooms(data);
      console.log(rooms);
    });

    socket.on("current_room", (data) => {
      setCurrentRoom(data.name);
    });

    socket.on("joined_room", (data) => {
      console.log(`${data} has joined the room`);
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

    // socket.on(
    //   "chatMessage",
    //   ({ message, clientID, randomColor, avatar, currentRoom }) => {
    //     console.log(message, clientID, randomColor, avatar, currentRoom);
    //     // setMessages((prevMessage) => {
    //     //   return [
    //     //     ...prevMessage,
    //     //     { message, clientID, randomColor, avatar, currentRoom },
    //     //   ];
    //     // });
    //   }
    // );

    socket.on("chatMessage2", (data) => {
      console.log("get chat");
      console.log(data);
      setMessages((prevMessage) => {
        return [
          ...prevMessage,
          {
            message: data.message,
            clientID: data.clientID,
            randomColor: data.randomColor,
            avatar: data.avatar,
            currentRoom: data.currentRoom,
          },
        ];
      });
    });

    socket.on("disconnect", () => {
      setRooms([]);
      setMessages([]);
    });

    // socket.on("new_client", (data) => {
    //   console.log(data);
    // });

    return () => socket.off();
  }, []);

  console.log(messages);
  console.log(currentRoom);
  console.log(rooms);

  const handleMessage = (message) => {
    socket.emit("chatMessage", {
      message,
      clientID,
      randomColor,
      avatar,
      currentRoom,
    });
  };

  const addRoom = (roomName) => {
    console.log("addRoom");
    console.log(roomName);
    socket.emit("add_room", roomName);
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
            borderBottom="1px solid black"
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
            bg="blackAlpha.900"
            color="whiteAlpha.900"
            rowSpan={5}
            colSpan={1}
            alignSelf="flex-start"
            borderRight="2px solid black"
            borderRadius={10}
            p={2}
            minH="100%"
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
                        addRoom(currentRoom);
                        // setRoom("");
                      }}
                    />
                    <Input
                      variant="outline"
                      maxW="150px"
                      // bg="gray.100"
                      // color="blackAlpha.900"
                      value={currentRoom}
                      fontSize="lg"
                      onChange={(e) => setCurrentRoom(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          joinRoom(currentRoom);
                          // setRoom("");
                        }
                      }}
                    />
                  </InputGroup>
                  {rooms &&
                    rooms.reverse().map((room) => (
                      <Text
                        bgColor={currentRoom === room.name && "green"}
                        // onClick={() => joinRoom(room.name)}
                      >
                        {room.name}
                      </Text>
                    ))}
                </Collapse>
              </Flex>
              <Flex flexDir="column" p={1} m={1}>
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
                {/* {clients &&
                  clients
                    .reverse()
                    .map((client) => <Text>{client.slice(0, 5)}</Text>)} */}
              </Flex>
            </Flex>
          </GridItem>
          <GridItem
            rowSpan={5}
            colSpan={2}
            alignSelf="flex-end"
            borderRight="2px solid black"
            borderRadius={10}
            p={2}

            // my={2}
            // minH="100%"
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
                      <Text>{message.currentRoom}</Text>
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
