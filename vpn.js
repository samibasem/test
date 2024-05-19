const startButton = document.getElementById('startButton');
const log = document.getElementById('log');
const proxyFrame = document.getElementById('proxyFrame');
let localConnection;
let remoteConnection;
let sendChannel;
let receiveChannel;

startButton.onclick = () => {
   startVPN();
};

function startVPN() {
   localConnection = new RTCPeerConnection();
   sendChannel = localConnection.createDataChannel('sendDataChannel');
   sendChannel.onopen = onSendChannelStateChange;
   sendChannel.onclose = onSendChannelStateChange;

   localConnection.onicecandidate = e => {
       if (e.candidate) {
           remoteConnection.addIceCandidate(e.candidate);
       }
   };

   remoteConnection = new RTCPeerConnection();
   remoteConnection.ondatachannel = receiveChannelCallback;
   remoteConnection.onicecandidate = e => {
       if (e.candidate) {
           localConnection.addIceCandidate(e.candidate);
       }
   };

   localConnection.createOffer()
       .then(offer => localConnection.setLocalDescription(offer))
       .then(() => remoteConnection.setRemoteDescription(localConnection.localDescription))
       .then(() => remoteConnection.createAnswer())
       .then(answer => remoteConnection.setLocalDescription(answer))
       .then(() => localConnection.setRemoteDescription(remoteConnection.localDescription));
}

function receiveChannelCallback(event) {
   receiveChannel = event.channel;
   receiveChannel.onmessage = onReceiveMessageCallback;
   receiveChannel.onopen = onReceiveChannelStateChange;
   receiveChannel.onclose = onReceiveChannelStateChange;
}

function onSendChannelStateChange() {
   const readyState = sendChannel.readyState;
   log.textContent += `Send channel state is: ${readyState}\n`;
   if (readyState === 'open') {
       sendChannel.send('Hello from the send channel!');
   }
}

function onReceiveChannelStateChange() {
   const readyState = receiveChannel.readyState;
   log.textContent += `Receive channel state is: ${readyState}\n`;
}

function onReceiveMessageCallback(event) {
   log.textContent += `Received Message: ${event.data}\n`;
}

