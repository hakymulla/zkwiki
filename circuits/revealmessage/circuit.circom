pragma circom 2.0.0;

include "mimcsponge.circom";

template Reveal() {

    signal input secret;
    signal input msgheader;
    signal input msgHash;

    component hash = MiMCSponge(2,220,1);
    hash.k <== 0;
    hash.ins[0] <== secret;
    hash.ins[1] <== msgheader;
    msgHash === hash.outs[0]; 
}

component main {public [msgHash, msgheader]} = Reveal();