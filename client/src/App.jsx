import { useState, useEffect } from "react";
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
} from "@chakra-ui/react";

import { io } from "socket.io-client";

let socket;

function App() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [clientID, setClientID] = useState("");
  const [randomColor, setRandomColor] = useState("");

  useEffect(() => {
    socket = io("http://localhost:4000");

    socket.on("connect", () => {
      console.log("Ansluten till servern");
    });

    socket.on("message", (data) => {
      console.log(data);
    });

    socket.on("clientID", (data) => {
      setClientID(data);
      const random = Math.floor(Math.random() * 16777215).toString(16);
      console.log(random);
      setRandomColor(random);
    });

    socket.on("chatMessage", ({ message, clientID, randomColor }) => {
      console.log(message);
      console.log(clientID);
      console.log(randomColor);

      setMessages((prevMessage) => {
        return [...prevMessage, { message, clientID, randomColor }];
      });
      console.log(messages);
    });

    // socket.on("new_client", (data) => {
    //   console.log(data);
    // });

    return () => socket.off();
  }, []);

  const handleMessage = (message) => {
    socket.emit("chatMessage", { message, clientID, randomColor });
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
                    ? `Welcome ${clientID.slice(0, 10)}`
                    : "Waiting for server..."}
                </Text>
                <Button
                  colorScheme="purple"
                  alignSelf="flex-end"
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
                <Text textDecor="underline">Room 1</Text>
                <Text>Room 2</Text>
                <Button
                  // isDisabled
                  m={0}
                  p={0}
                  bg="none"
                  fontSize="1xl"
                  leftIcon={<IoAddOutline />}
                >
                  Add room
                </Button>
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
                <Text>User 1</Text>
                <Text>User 2</Text>
                <Text>User 3</Text>
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
                      flexDir="column"
                      border="1px solid purple"
                      bgColor={`#${message.randomColor}`}
                      bgGradient="revert"
                      borderRadius={6}
                      p={1}
                      overflowWrap="break-word"
                    >
                      <Text fontSize="10px">{message.clientID}</Text>
                      <Text color="white">{message.message}</Text>
                    </Flex>
                  ))}
                <InputGroup>
                  <InputLeftElement children={<BsChatFill />} />
                  <Input
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
