// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "./sendVerifier.sol";
import "./revealVerifier.sol";

contract Message {

    SendVerifier sendVerifier;
    RevealVerifier revealVerifier;
    
    uint256[] public users;
    mapping(uint256 => bool) userExists;

    struct MessageStruct {
        bool isrevealed;
        uint256 msghash;
    }
    
    MessageStruct[] public messages;

    constructor(address _sendVerifier, address _revealVerifier) {
        sendVerifier = SendVerifier(_sendVerifier);
        revealVerifier = RevealVerifier(_revealVerifier);
    }

    function createUser() public {
        uint256 userhash = uint256(keccak256(abi.encodePacked(msg.sender)));
        require(userExists[userhash] == false, "User already exists");
        userExists[userhash]  = true;
        users.push(userhash);
    }

    function userExist() public view returns (bool){
        uint256 userhash = uint256(keccak256(abi.encodePacked(msg.sender)));
        return userExists[userhash];
    }

    function sendMessage(
        uint[2] memory _a,
        uint[2][2] memory _b,
        uint[2] memory _c,
        uint[2] memory _input
    ) public {
        require(sendVerifier.verifyProof(_a, _b, _c, _input), "Invalid Message Proof");

        MessageStruct memory message;
        message.msghash = _input[0];
        messages.push(message);
    }

    function revealMessage(
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
                break;
            }
        }
    }    

}