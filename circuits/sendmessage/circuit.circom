pragma circom 2.0.0;

include "mimcsponge.circom";

template HashLeftRight() {
    signal input left;
    signal input right;

    signal output hash;

    component mimc = MiMCSponge(2, 220, 1);
    mimc.ins[0] <== left;
    mimc.ins[1] <== right;
    mimc.k <== 0;

    hash <== mimc.outs[0];
}

template MerkleTree(N) {
    signal input leaves[N];
    signal output root;

    component comp[N-1];

    for(var i = 0; i < N-1; i++){
       comp[i] = HashLeftRight();
   }

    for(var i = 0; i < N/2; i++){
        comp[i].left <== leaves[i*2];
        comp[i].right <== leaves[i*2 +1];
   }

    var y = N/2; 
    var l = 0;
    var c = N/2; 
    var m = y/2; 
    var n = 0;
    while(y!=1) {
        y = y/2;
        n = c+m; 
        for(var i = c; i < n; i++){
            comp[i].left <== comp[l].hash;
            comp[i].right <== comp[l+1].hash;
            l = l+2;
        }    
        c = n; 
        m = m/2; 
    }
    root <== comp[N-2].hash;
}

component main {public [leaves]} = MerkleTree(4);