pragma circom 2.0.0;

include "mimcsponge.circom";

template SendMessage() {

    signal input secret;
    signal input salt;
    signal input msgheader;
    signal output msgHash;

    component hash = MiMCSponge(3,220,1);
    hash.k <== 0;
    hash.ins[0] <== secret;
    hash.ins[1] <== salt;
    hash.ins[2] <== msgheader;
    msgHash <== hash.outs[0]; 
}

component main {public [secret, salt, msgheader]} = SendMessage();