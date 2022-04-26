// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "./sendVerifier.sol";
import "./revealVerifier.sol";

contract Message {

    SendVerifier sendVerifier;
    RevealVerifier revealVerifier;
    uint256 public msgCount = 0;

    struct MessageStruct {
        string msgheader;
        string msgbody;
        bool isrevealed;
        uint256 msghash;
    }
    
    MessageStruct[] public messages;

    event Send(uint256 indexed hash, string msgheader, bool revealed);
    event Revealed(uint256 indexed hash, string msgheader, bool revealed);

    constructor(address _sendVerifier, address _revealVerifier) {
        sendVerifier = SendVerifier(_sendVerifier);
        revealVerifier = RevealVerifier(_revealVerifier);
    }

    function sendMessage(
        string memory _msgheader,
        uint[2] memory _a,
        uint[2][2] memory _b,
        uint[2] memory _c,
        uint[2] memory _input
    ) public {
        require(sendVerifier.verifyProof(_a, _b, _c, _input), "Invalid Message Proof");

        MessageStruct memory message;
        message.msghash = _input[0];
        message.msgheader = _msgheader;
        messages.push(message);
        msgCount++;
        emit Send(message.msghash, message.msgheader, message.isrevealed);
    }

    function revealMessage(
        string memory _msgbody,
        uint[2] memory _a,
        uint[2][2] memory _b,
        uint[2] memory _c,
        uint[2] memory _input
    ) public {
        require(revealVerifier.verifyProof(_a, _b, _c, _input), "Invalid Reveal Proof");
        for (uint i = 0; i < messages.length; i++) {
            if (messages[i].msghash == _input[1]) {
                MessageStruct storage message = messages[i];
                message.isrevealed = true;
                message.msgbody = _msgbody;
                emit Send(message.msghash, message.msgbody, message.isrevealed);
                break;
            }
        }
    }

    function getMessageStruct() public view returns (string[] memory, string[] memory, bool[] memory){
        string[] memory header = new string[] (msgCount);
        string[] memory body = new string[] (msgCount);
        bool[] memory revealed = new bool[] (msgCount);
        for (uint i = 0; i < msgCount; i++) {
            MessageStruct storage message = messages[i];
            header[i] = message.msgheader;
            body[i] = message.msgbody;
            revealed[i] = message.isrevealed;
        }
        return(header, body, revealed);
    }

}
