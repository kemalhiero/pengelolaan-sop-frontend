export function convertToBpmnXml(steps, implementers) {
  // Fungsi helper untuk menghasilkan ID yang konsisten
  const getTaskId = (step) => `Task_${step.id_step}`;
  
  // Struktur dasar XML BPMN
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
                  id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">`;
  
  // Tambahkan lanes
  xml += `
    <bpmn:laneSet id="LaneSet_1">`;
  
  implementers.forEach(imp => {
    // Filter langkah untuk implementer ini
    const impSteps = steps.filter(step => step.id_implementer === imp.id);
    
    // Tambahkan lane hanya jika memiliki langkah
    if (impSteps.length > 0) {
      xml += `
      <bpmn:lane id="Lane_${imp.id}" name="${imp.name}">
        <bpmn:flowNodeRef>`;
      
      // Referensi setiap task di lane ini (menggunakan ID yang konsisten)
      impSteps.forEach(step => {
        xml += `${getTaskId(step)} `;
      });
      
      xml += `</bpmn:flowNodeRef>
      </bpmn:lane>`;
    }
  });
  
  xml += `
    </bpmn:laneSet>`;
  
  // Tambahkan setiap task/event/gateway
  steps.forEach(step => {
    const taskId = getTaskId(step);
    
    if (step.type === 'terminator') {
      if (step.seq_number === 1) {
        // Start event
        xml += `
    <bpmn:startEvent id="${taskId}" name="${step.name}">`;
      } else {
        // End event
        xml += `
    <bpmn:endEvent id="${taskId}" name="${step.name}">`;
      }
    } else if (step.type === 'decision') {
      xml += `
    <bpmn:exclusiveGateway id="${taskId}" name="${step.name}">`;
    } else { // Task biasa
      xml += `
    <bpmn:task id="${taskId}" name="${step.name}">`;
    }
    
    // Tambahkan referensi outgoing flow
    if (step.id_next_step_if_yes) {
      const flowId = `Flow_${step.id_step}_${step.id_next_step_if_yes}_yes`;
      xml += `
      <bpmn:outgoing>${flowId}</bpmn:outgoing>`;
    }
    
    if (step.id_next_step_if_no) {
      const flowId = `Flow_${step.id_step}_${step.id_next_step_if_no}_no`;
      xml += `
      <bpmn:outgoing>${flowId}</bpmn:outgoing>`;
    }
    
    // Tutup tag elemen
    const elementType = step.type === 'terminator' 
      ? (step.seq_number === 1 ? 'startEvent' : 'endEvent')
      : (step.type === 'decision' ? 'exclusiveGateway' : 'task');
    
    xml += `
    </bpmn:${elementType}>`;
  });
  
  // Tambahkan sequence flows
  steps.forEach(step => {
    const sourceId = getTaskId(step);
    
    // Tambahkan flow "Ya"
    if (step.id_next_step_if_yes) {
      const targetStep = steps.find(s => s.id_step === step.id_next_step_if_yes);
      if (targetStep) {
        const targetId = getTaskId(targetStep);
        const flowId = `Flow_${step.id_step}_${step.id_next_step_if_yes}_yes`;
        
        xml += `
    <bpmn:sequenceFlow id="${flowId}" name="Ya" sourceRef="${sourceId}" targetRef="${targetId}" />`;
      }
    }
    
    // Tambahkan flow "Tidak"
    if (step.id_next_step_if_no) {
      const targetStep = steps.find(s => s.id_step === step.id_next_step_if_no);
      if (targetStep) {
        const targetId = getTaskId(targetStep);
        const flowId = `Flow_${step.id_step}_${step.id_next_step_if_no}_no`;
        
        xml += `
    <bpmn:sequenceFlow id="${flowId}" name="Tidak" sourceRef="${sourceId}" targetRef="${targetId}" />`;
      }
    }
  });
  
  // Tambahkan visualisasi diagram
  xml += `
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">`;
  
  // Tambahkan shape untuk lanes
  let laneYPos = 0;
  
  implementers.forEach(imp => {
    const laneHeight = 150; // Tinggi lane tetap
    
    xml += `
      <bpmndi:BPMNShape id="Lane_${imp.id}_di" bpmnElement="Lane_${imp.id}" isHorizontal="true">
        <dc:Bounds x="100" y="${laneYPos}" width="${100 + steps.length * 150}" height="${laneHeight}" />
      </bpmndi:BPMNShape>`;
    
    laneYPos += laneHeight;
  });
  
  // Tambahkan shape untuk tasks dengan layout dasar
  let xPos = 150;
  const yOffset = 150;
  
  steps.forEach(step => {
    const taskId = getTaskId(step);
    // Hitung posisi y berdasarkan implementer (lane)
    const yPos = 100 + ((step.id_implementer - 1) * yOffset);
    
    // Lebar dan tinggi berdasarkan jenis elemen
    let width = 100;
    let height = 80;
    
    if (step.type === 'terminator') {
      width = 36;
      height = 36;
    } else if (step.type === 'decision') {
      width = 50;
      height = 50;
    }
    
    xml += `
      <bpmndi:BPMNShape id="${taskId}_di" bpmnElement="${taskId}">
        <dc:Bounds x="${xPos}" y="${yPos}" width="${width}" height="${height}" />
      </bpmndi:BPMNShape>`;
    
    // Tambahkan posisi x untuk elemen berikutnya
    xPos += 150;
  });
  
  // Tambahkan edges untuk sequence flows
  steps.forEach(step => {
    const sourceX = 150 + ((step.seq_number - 1) * 150);
    const sourceY = 100 + ((step.id_implementer - 1) * yOffset);
    
    // Tambahkan visualisasi flow "Ya"
    if (step.id_next_step_if_yes) {
      const targetStep = steps.find(s => s.id_step === step.id_next_step_if_yes);
      if (targetStep) {
        const targetX = 150 + ((targetStep.seq_number - 1) * 150);
        const targetY = 100 + ((targetStep.id_implementer - 1) * yOffset);
        const flowId = `Flow_${step.id_step}_${step.id_next_step_if_yes}_yes`;
        
        xml += `
      <bpmndi:BPMNEdge id="${flowId}_di" bpmnElement="${flowId}">
        <di:waypoint x="${sourceX}" y="${sourceY}" />
        <di:waypoint x="${targetX}" y="${targetY}" />
      </bpmndi:BPMNEdge>`;
      }
    }
    
    // Tambahkan visualisasi flow "Tidak"
    if (step.id_next_step_if_no) {
      const targetStep = steps.find(s => s.id_step === step.id_next_step_if_no);
      if (targetStep) {
        const targetX = 150 + ((targetStep.seq_number - 1) * 150);
        const targetY = 100 + ((targetStep.id_implementer - 1) * yOffset);
        const flowId = `Flow_${step.id_step}_${step.id_next_step_if_no}_no`;
        
        xml += `
      <bpmndi:BPMNEdge id="${flowId}_di" bpmnElement="${flowId}">
        <di:waypoint x="${sourceX}" y="${sourceY}" />
        <di:waypoint x="${targetX}" y="${targetY}" />
      </bpmndi:BPMNEdge>`;
      }
    }
  });
  
  // Tutup tag diagram
  xml += `
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;
  
  return xml;
}
