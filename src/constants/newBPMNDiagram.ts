import { customAlphabet } from 'nanoid';

interface GetNewDiagram {
    processName: string;
    newBPMNDiagram: string;
}

const getNewBPMNDiagram = (): GetNewDiagram => {
    const alphabets = '0123456789abcdefghijklmnopqrstuvwxyz';
    const getUniqueID = customAlphabet(alphabets, 7);
    const processID = getUniqueID();
    const processName = `Process_${processID}`;

    const newBPMNDiagram =
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:camunda="http://camunda.org/schema/1.0/bpmn" id="sample-diagram" targetNamespace="http://bpmn.io/schema/bpmn" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd">\n' +
        `  <bpmn2:process id="Process_${processID}" name="Process 1" isExecutable="true" camunda:versionTag="1">\n` +
        '    <bpmn2:startEvent id="StartEvent_1">\n' +
        '      <bpmn2:outgoing>Flow_1vtpmk5</bpmn2:outgoing>\n' +
        '    </bpmn2:startEvent>\n' +
        '    <bpmn2:task id="Activity_0szwhvv">\n' +
        '      <bpmn2:incoming>Flow_1vtpmk5</bpmn2:incoming>\n' +
        '    </bpmn2:task>\n' +
        '    <bpmn2:sequenceFlow id="Flow_1vtpmk5" sourceRef="StartEvent_1" targetRef="Activity_0szwhvv" />\n' +
        '  </bpmn2:process>\n' +
        '  <bpmndi:BPMNDiagram id="BPMNDiagram_1">\n' +
        `    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_${processID}">\n` +
        '      <bpmndi:BPMNEdge id="Flow_1vtpmk5_di" bpmnElement="Flow_1vtpmk5">\n' +
        '        <di:waypoint x="248" y="170" />\n' +
        '        <di:waypoint x="300" y="170" />\n' +
        '      </bpmndi:BPMNEdge>\n' +
        '      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">\n' +
        '        <dc:Bounds x="212" y="152" width="36" height="36" />\n' +
        '      </bpmndi:BPMNShape>\n' +
        '      <bpmndi:BPMNShape id="Activity_0szwhvv_di" bpmnElement="Activity_0szwhvv">\n' +
        '        <dc:Bounds x="300" y="130" width="100" height="80" />\n' +
        '      </bpmndi:BPMNShape>\n' +
        '    </bpmndi:BPMNPlane>\n' +
        '  </bpmndi:BPMNDiagram>\n' +
        '</bpmn2:definitions>\n';
    return { processName: processName, newBPMNDiagram: newBPMNDiagram };
};

export default getNewBPMNDiagram;
