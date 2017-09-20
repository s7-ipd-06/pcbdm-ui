# Architecture

## Components

### FileList
* Lists files dragged onto it

### PCBViewer
* Shows the PCB and its holes
* Shows the path of the tool determined by the selected algorithm

### AlgorithmSelector
* Shows the algorithms to be compared
* Shows a selected algorithms its path on the PCB viewer
* Reorders the holes based on the fastests agorithm

### HoleBrowser
* Shows all holes by size
* When a hole is selected it will be highlighted on the PCBViewer

### SizeMapper
* Shows the different sizes of holes in PCB
* Maps hole sizes to tool sizes

### SerialMonitor
* Shows messages being send/received
* Allows a custom message to be send
* Allows the serial port to be selected and shows the connection state

### ProcessControl
* Start/pause/cancel button to control automatic hole drilling process by sending coordinates to the serial monitor

### ManualControl
* Allows control of the machine by sending commands to the serial monitor

