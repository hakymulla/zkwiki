// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
import "./sendVerifier.sol";

contract Message{

    SendVerifier sendVerifier;
    uint256[] public users;
    mapping(uint256 => bool) userExists;

    struct MessageStruct {
        uint256 user;
        string text;
        bool isrevealed;
        uint256 secret;
        uint256 msghash;

    }
    MessageStruct[] public messages;

    constructor(address _sendVerifier) {
        sendVerifier = SendVerifier(_sendVerifier);
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
        string memory _message,
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256[4] memory _input 
    ) public {
        uint256 userhash = uint256(keccak256(abi.encodePacked(msg.sender)));
        require(userExists[userhash], "User must be registered");
        // require(!msgAttestations[_input[0]], "Please change salt, must have unique msgAttestation");
        require(sendVerifier.verifyProof(_a, _b, _c, _input), "Invalid Message Proof");
        // msgAttestations[_input[0]] = true;

        MessageStruct memory message;
        message.user = userhash;
        message.text = _message;
        message.msghash = _input[0];
        messages.push(message);
    }

}