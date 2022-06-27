import {
  Flex,
  Avatar,
  AvatarBadge,
  Text,
  Divider,
  Button,
  //   AlwaysScrollToBottom,
  Input,
} from "@chakra-ui/react";
import React, { useState } from "react";

function Chat() {
  const messages = [];
  return (
    <Flex w="100%" h="100vh" justify="center" align="center">
      <Flex w="40%" h="90%" flexDir="column">
        <Flex w="100%">
          <Avatar
            size="lg"
            name="Dan Abrahmov"
            src="https://bit.ly/dan-abramov"
          >
            <AvatarBadge boxSize="1.25em" bg="green.500" />
          </Avatar>
          <Flex flexDirection="column" mx="5" justify="center">
            <Text fontSize="lg" fontWeight="bold">
              Ferin Patel
            </Text>
            <Text color="green.500">Online</Text>
          </Flex>
        </Flex>
        <Divider />
        <Flex w="100%" h="80%" overflowY="scroll" flexDirection="column" p="3">
          {messages &&
            messages.map((item, index) => {
              if (item.from === "me") {
                return (
                  <Flex key={index} w="100%" justify="flex-end">
                    <Flex
                      bg="black"
                      color="white"
                      minW="100px"
                      maxW="350px"
                      my="1"
                      p="3"
                    >
                      <Text>{item.text}</Text>
                    </Flex>
                  </Flex>
                );
              } else {
                return (
                  <Flex key={index} w="100%">
                    <Avatar
                      name="Computer"
                      src="https://avataaars.io/?avatarStyle=Transparent&topType=LongHairStraight&accessoriesType=Blank&hairColor=BrownDark&facialHairType=Blank&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light"
                      bg="blue.300"
                    ></Avatar>
                    <Flex
                      bg="gray.100"
                      color="black"
                      minW="100px"
                      maxW="350px"
                      my="1"
                      p="3"
                    >
                      <Text>{item.text}</Text>
                    </Flex>
                  </Flex>
                );
              }
            })}
          {/* <AlwaysScrollToBottom /> */}
        </Flex>
        {/* <Divider /> */}
        <Flex w="100%" mt="5">
          <Input
            placeholder="Type Something..."
            border="none"
            borderRadius="none"
            _focus={{
              border: "1px solid black",
            }}
            // onKeyPress={(e) => {
            //   if (e.key === "Enter") {
            //     handleSendMessage();
            //   }
            // }}
            // value={inputMessage}
            // onChange={(e) => setInputMessage(e.target.value)}
          />
          <Button
            bg="black"
            color="white"
            borderRadius="none"
            _hover={{
              bg: "white",
              color: "black",
              border: "1px solid black",
            }}
            // disabled={inputMessage.trim().length <= 0}
            // onClick={handleSendMessage}
          >
            Send
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}

export default Chat;
