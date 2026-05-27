import React, { useState } from 'react';
import {
  Box, Text, Input, HStack, VStack, IconButton, Wrap, WrapItem,
  Tag, TagLabel, TagCloseButton, Divider, Accordion, AccordionItem,
  AccordionButton, AccordionPanel, AccordionIcon,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

const inputProps = {
  bg: 'gray.800', borderColor: 'gray.600', color: 'white', size: 'sm',
  _placeholder: { color: 'gray.500' }, _hover: { borderColor: 'gray.500' },
};

const EquipmentFields = ({ module, fields, defaults, setDefaults, readOnly }) => (
  <>
    <Text color="blue.100" fontSize="xs">Equipment</Text>
    {fields.map(f => (
      <Box key={f.key}>
        <Text color="gray.400" fontSize="xs" mb={1}>{f.label}</Text>
        <Input
          type={f.type || 'text'}
          step={f.step}
          value={defaults?.[module]?.[f.key] || ''}
          isReadOnly={readOnly}
          onChange={(e) => {
            if (readOnly) return;
            const val = f.type === 'number' ? (parseFloat(e.target.value) || 0) : e.target.value;
            setDefaults(prev => ({ ...prev, [module]: { ...prev[module], [f.key]: val } }));
          }}
          {...inputProps}
        />
      </Box>
    ))}
  </>
);

const SimpleTagList = ({ items, color, onRemove, renderLabel, readOnly }) => (
  <Wrap spacing={2}>
    {items.map((item, i) => (
      <WrapItem key={typeof item === 'string' ? item : i}>
        <Tag size="md" colorScheme={color} variant="solid" borderRadius="full">
          <TagLabel>{renderLabel ? renderLabel(item) : item}</TagLabel>
          {!readOnly && <TagCloseButton onClick={() => onRemove(i, item)} />}
        </Tag>
      </WrapItem>
    ))}
  </Wrap>
);

const AddButton = ({ color, onClick, label }) => (
  <IconButton
    icon={<AddIcon />} size="sm" variant="outline"
    colorScheme={color} color={`${color}.200`} borderColor={`${color}.400`}
    _hover={{ bg: `${color}.900` }}
    onClick={onClick} aria-label={label}
  />
);

const SingleInputAdder = ({ stateKey, placeholder, color, inputs, setInputs, onAdd }) => {
  const value = inputs[stateKey] || '';
  const doAdd = () => {
    const trimmed = value.trim();
    if (trimmed) { onAdd(trimmed); setInputs(prev => ({ ...prev, [stateKey]: '' })); }
  };
  return (
    <HStack>
      <Input
        value={value}
        onChange={(e) => setInputs(prev => ({ ...prev, [stateKey]: e.target.value }))}
        placeholder={placeholder}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); doAdd(); } }}
        {...inputProps}
      />
      <AddButton color={color} onClick={doAdd} label={`Add ${placeholder}`} />
    </HStack>
  );
};

const DoseFxAdder = ({ doseKey, fxKey, color, inputs, setInputs, onAdd }) => {
  const doAdd = () => {
    const d = parseFloat(inputs[doseKey]);
    const f = parseInt(inputs[fxKey]);
    if (d > 0 && f > 0) {
      onAdd(d, f);
      setInputs(prev => ({ ...prev, [doseKey]: '', [fxKey]: '' }));
    }
  };
  return (
    <HStack>
      <Input type="number" value={inputs[doseKey] || ''} onChange={(e) => setInputs(prev => ({ ...prev, [doseKey]: e.target.value }))} placeholder="Gy" {...inputProps} />
      <Input type="number" value={inputs[fxKey] || ''} onChange={(e) => setInputs(prev => ({ ...prev, [fxKey]: e.target.value }))} placeholder="fx"
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); doAdd(); } }} {...inputProps} />
      <AddButton color={color} onClick={doAdd} label="Add preset" />
    </HStack>
  );
};

const SectionWrapper = ({ visKey, visibleModules, label, color, children }) => {
  if (visibleModules[visKey] === false) return null;
  return (
    <AccordionItem border="none">
      <AccordionButton bg="gray.700" borderRadius="md" _hover={{ bg: 'gray.600' }} mt={2}>
        <Box flex="1" textAlign="left">
          <Text color={`${color}.200`} fontSize="sm">{label}</Text>
        </Box>
        <AccordionIcon color="gray.400" />
      </AccordionButton>
      <AccordionPanel pb={4} bg="gray.700" borderRadius="0 0 md md" borderTop="1px" borderColor="gray.600">
        <VStack spacing={4} align="stretch" pt={2}>
          {children}
        </VStack>
      </AccordionPanel>
    </AccordionItem>
  );
};

const SettingsEditor = ({
  editVisibleModules, editFacilityDefaults, setEditFacilityDefaults,
  editModulePresets, setEditModulePresets,
  editPhysicians, setEditPhysicians, editPhysicists, setEditPhysicists,
  newPhysician, setNewPhysician, newPhysicist, setNewPhysicist, addName, removeName,
  readOnly = false,
}) => {
  const [inputs, setInputs] = useState({});

  const updatePresetArray = (module, field, updater) => {
    setEditModulePresets(prev => ({
      ...prev,
      [module]: { ...prev[module], [field]: updater(prev[module]?.[field] || []) }
    }));
  };

  const removeFromPresetArray = (module, field, filterFn) => {
    setEditModulePresets(prev => ({
      ...prev,
      [module]: { ...prev[module], [field]: (prev[module]?.[field] || []).filter(filterFn) }
    }));
  };

  return (
    <Accordion allowMultiple>
      {/* Clinic Staff */}
      <AccordionItem border="none">
        <AccordionButton bg="gray.700" borderRadius="md" _hover={{ bg: 'gray.600' }} mt={2}>
          <Box flex="1" textAlign="left"><Text color="purple.200" fontSize="sm">Clinic Staff</Text></Box>
          <AccordionIcon color="gray.400" />
        </AccordionButton>
        <AccordionPanel pb={4} bg="gray.700" borderRadius="0 0 md md" borderTop="1px" borderColor="gray.600">
          <VStack spacing={4} align="stretch" pt={2}>
            {[
              { label: 'Physicians', list: editPhysicians, setList: setEditPhysicians, val: newPhysician, setVal: setNewPhysician, color: 'blue' },
              { label: 'Physicists', list: editPhysicists, setList: setEditPhysicists, val: newPhysicist, setVal: setNewPhysicist, color: 'purple' },
            ].map(({ label, list, setList, val, setVal, color }, idx) => (
              <React.Fragment key={label}>
                {idx > 0 && <Divider borderColor="gray.600" />}
                <Box>
                  <Text color="gray.300" fontSize="xs" mb={2}>{label}</Text>
                  <Wrap spacing={2} mb={3}>
                    {list.map(name => (
                      <WrapItem key={name}>
                        <Tag size="md" colorScheme={color} variant="solid" borderRadius="full">
                          <TagLabel>{name}</TagLabel>
                          {!readOnly && <TagCloseButton onClick={() => removeName(list, setList, name)} />}
                        </Tag>
                      </WrapItem>
                    ))}
                    {list.length === 0 && <Text color="gray.500" fontSize="xs" fontStyle="italic">None added</Text>}
                  </Wrap>
                  {!readOnly && (
                    <HStack>
                      <Input
                        value={val} onChange={(e) => setVal(e.target.value)}
                        placeholder={`Add ${label.toLowerCase().slice(0, -1)} name`}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addName(list, setList, val, setVal); } }}
                        {...inputProps}
                      />
                      <AddButton color={color} onClick={() => addName(list, setList, val, setVal)} label={`Add ${label.toLowerCase().slice(0, -1)}`} />
                    </HStack>
                  )}
                </Box>
              </React.Fragment>
            ))}
          </VStack>
        </AccordionPanel>
      </AccordionItem>

      {/* SBRT Settings */}
      <SectionWrapper visKey="sbrt" visibleModules={editVisibleModules} label="SBRT Settings" color="orange">
        <EquipmentFields module="sbrt" defaults={editFacilityDefaults} setDefaults={setEditFacilityDefaults} readOnly={readOnly}
          fields={[
            { key: 'planning_system', label: 'Planning System' },
            { key: 'accelerator', label: 'Accelerator' },
            { key: 'imaging_system', label: 'Imaging System' },
            { key: 'gating_system', label: 'Gating System (DIBH)' },
          ]}
        />
        <Divider borderColor="gray.600" />
        <Text color="gray.300" fontSize="xs">Treatment Sites</Text>
        <SimpleTagList items={editModulePresets?.sbrt?.treatment_sites || []} color="orange" readOnly={readOnly}
          renderLabel={(s) => s.label}
          onRemove={(_, site) => removeFromPresetArray('sbrt', 'treatment_sites', s => s.id !== site.id)}
        />
        {!readOnly && (
          <SingleInputAdder stateKey="sbrtSite" placeholder="Add site (e.g. Adrenal)" color="orange"
            inputs={inputs} setInputs={setInputs}
            onAdd={(val) => {
              const id = val.toLowerCase().replace(/\s+/g, '_');
              updatePresetArray('sbrt', 'treatment_sites', arr => [...arr, { id, label: val }]);
            }}
          />
        )}
        <Divider borderColor="gray.600" />
        <Text color="gray.300" fontSize="xs">Breathing Techniques</Text>
        <SimpleTagList items={editModulePresets?.sbrt?.breathing_techniques || []} color="orange" readOnly={readOnly}
          renderLabel={(t) => t.label}
          onRemove={(i) => removeFromPresetArray('sbrt', 'breathing_techniques', (_, idx) => idx !== i)}
        />
      </SectionWrapper>

      {/* SRS Settings */}
      <SectionWrapper visKey="srs" visibleModules={editVisibleModules} label="SRS Settings" color="orange">
        <EquipmentFields module="srs" defaults={editFacilityDefaults} setDefaults={setEditFacilityDefaults} readOnly={readOnly}
          fields={[
            { key: 'planning_system', label: 'Planning System' },
            { key: 'accelerator', label: 'Accelerator' },
            { key: 'tracking_system', label: 'Tracking System' },
            { key: 'immobilization_device', label: 'Immobilization' },
            { key: 'mri_sequence', label: 'MRI Sequence' },
            { key: 'ct_slice_thickness', label: 'CT Slice Thickness (mm)', type: 'number', step: '0.25' },
          ]}
        />
        <Divider borderColor="gray.600" />
        <Text color="blue.100" fontSize="xs">Dose Presets</Text>
        <Text color="gray.300" fontSize="xs">SRS Dose Presets (Gy, single fraction)</Text>
        <SimpleTagList items={editModulePresets?.srs?.srs_dose_presets || []} color="orange" readOnly={readOnly}
          renderLabel={(d) => `${d} Gy`}
          onRemove={(_, dose) => removeFromPresetArray('srs', 'srs_dose_presets', d => d !== dose)}
        />
        {!readOnly && (
          <SingleInputAdder stateKey="srsDose" placeholder="Gy" color="orange" inputs={inputs} setInputs={setInputs}
            onAdd={(val) => {
              const v = parseFloat(val);
              if (v > 0) updatePresetArray('srs', 'srs_dose_presets', arr => [...arr, v].sort((a, b) => a - b));
            }}
          />
        )}
        <Divider borderColor="gray.600" />
        <Text color="gray.300" fontSize="xs">SRT Fractionation Presets</Text>
        <SimpleTagList items={editModulePresets?.srs?.srt_dose_presets || []} color="orange" readOnly={readOnly}
          renderLabel={(p) => `${p.dose}Gy/${p.fractions}fx`}
          onRemove={(i) => removeFromPresetArray('srs', 'srt_dose_presets', (_, idx) => idx !== i)}
        />
        {!readOnly && (
          <DoseFxAdder doseKey="srtDose" fxKey="srtFx" color="orange" inputs={inputs} setInputs={setInputs}
            onAdd={(d, f) => updatePresetArray('srs', 'srt_dose_presets', arr => [...arr, { dose: d, fractions: f }])}
          />
        )}
      </SectionWrapper>

      {/* TBI Settings */}
      <SectionWrapper visKey="tbi" visibleModules={editVisibleModules} label="TBI Settings" color="orange">
        <EquipmentFields module="tbi" defaults={editFacilityDefaults} setDefaults={setEditFacilityDefaults} readOnly={readOnly}
          fields={[
            { key: 'energy', label: 'Energy' },
            { key: 'dose_rate_range', label: 'Dose Rate Range' },
            { key: 'machine_dose_rate', label: 'Machine Dose Rate' },
          ]}
        />
        <Divider borderColor="gray.600" />
        <Text color="blue.100" fontSize="xs">Regimens</Text>
        <SimpleTagList
          items={Object.entries(editModulePresets?.tbi?.regimens || {})}
          color="orange" readOnly={readOnly}
          renderLabel={([, r]) => `${r.dose}Gy/${r.fractions}fx`}
          onRemove={(_, [key]) => {
            setEditModulePresets(prev => {
              const newRegimens = { ...prev.tbi.regimens };
              delete newRegimens[key];
              return { ...prev, tbi: { ...prev.tbi, regimens: newRegimens } };
            });
          }}
        />
        {!readOnly && (() => {
          const doAdd = () => {
            const label = (inputs.tbiLabel || '').trim();
            const d = parseFloat(inputs.tbiDose);
            const f = parseInt(inputs.tbiFx);
            if (label && d > 0 && f > 0) {
              const key = label.toLowerCase().replace(/[\s.\/]+/g, '');
              setEditModulePresets(prev => ({
                ...prev,
                tbi: { ...prev.tbi, regimens: { ...(prev.tbi?.regimens || {}), [key]: { dose: d, fractions: f, lung_blocks: f > 1 ? null : 'none' } } }
              }));
              setInputs(prev => ({ ...prev, tbiLabel: '', tbiDose: '', tbiFx: '' }));
            }
          };
          return (
            <HStack>
              <Input value={inputs.tbiLabel || ''} onChange={(e) => setInputs(prev => ({ ...prev, tbiLabel: e.target.value }))} placeholder="Label" {...inputProps} />
              <Input type="number" value={inputs.tbiDose || ''} onChange={(e) => setInputs(prev => ({ ...prev, tbiDose: e.target.value }))} placeholder="Gy" {...inputProps} />
              <Input type="number" value={inputs.tbiFx || ''} onChange={(e) => setInputs(prev => ({ ...prev, tbiFx: e.target.value }))} placeholder="fx"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); doAdd(); } }} {...inputProps} />
              <AddButton color="orange" onClick={doAdd} label="Add TBI regimen" />
            </HStack>
          );
        })()}
        <Divider borderColor="gray.600" />
        <Text color="blue.100" fontSize="xs">Setup Options</Text>
        <SimpleTagList items={editModulePresets?.tbi?.setup_options || []} color="orange" readOnly={readOnly}
          onRemove={(_, opt) => removeFromPresetArray('tbi', 'setup_options', s => s !== opt)} />
        {!readOnly && (
          <SingleInputAdder stateKey="tbiSetup" placeholder="e.g. Extended SSD" color="orange"
            inputs={inputs} setInputs={setInputs}
            onAdd={(val) => updatePresetArray('tbi', 'setup_options', arr => [...arr, val])} />
        )}
        <Divider borderColor="gray.600" />
        <Text color="blue.100" fontSize="xs">Lung Block (HVL) Options</Text>
        <SimpleTagList items={editModulePresets?.tbi?.hvl_options || []} color="orange" readOnly={readOnly}
          onRemove={(_, opt) => removeFromPresetArray('tbi', 'hvl_options', h => h !== opt)} />
        {!readOnly && (
          <SingleInputAdder stateKey="tbiHvl" placeholder="e.g. 4 HVL" color="orange"
            inputs={inputs} setInputs={setInputs}
            onAdd={(val) => updatePresetArray('tbi', 'hvl_options', arr => [...arr, val])} />
        )}
      </SectionWrapper>

      {/* DIBH Settings */}
      <SectionWrapper visKey="dibh" visibleModules={editVisibleModules} label="DIBH Settings" color="teal">
        <EquipmentFields module="dibh" defaults={editFacilityDefaults} setDefaults={setEditFacilityDefaults} readOnly={readOnly}
          fields={[
            { key: 'scanning_system', label: 'Scanning System' },
            { key: 'gating_device', label: 'Gating Device' },
          ]}
        />
        <Divider borderColor="gray.600" />
        <Text color="gray.300" fontSize="xs">Treatment Sites</Text>
        <SimpleTagList items={editModulePresets?.dibh?.treatment_sites || []} color="teal" readOnly={readOnly}
          onRemove={(_, site) => removeFromPresetArray('dibh', 'treatment_sites', s => s !== site)} />
        {!readOnly && (
          <SingleInputAdder stateKey="dibhSite" placeholder="Add site" color="teal"
            inputs={inputs} setInputs={setInputs}
            onAdd={(val) => updatePresetArray('dibh', 'treatment_sites', arr => [...arr, val])} />
        )}
        <Divider borderColor="gray.600" />
        <Text color="gray.300" fontSize="xs">Rx Presets</Text>
        <SimpleTagList items={editModulePresets?.dibh?.rx_presets || []} color="teal" readOnly={readOnly}
          renderLabel={(p) => `${p.dose}Gy/${p.fractions}fx`}
          onRemove={(i) => removeFromPresetArray('dibh', 'rx_presets', (_, idx) => idx !== i)} />
        {!readOnly && (
          <DoseFxAdder doseKey="rxDose" fxKey="rxFx" color="teal" inputs={inputs} setInputs={setInputs}
            onAdd={(d, f) => updatePresetArray('dibh', 'rx_presets', arr => [...arr, { dose: d, fractions: f }])} />
        )}
        <Divider borderColor="gray.600" />
        <Text color="gray.300" fontSize="xs">Boost Presets</Text>
        <SimpleTagList items={editModulePresets?.dibh?.boost_presets || []} color="teal" readOnly={readOnly}
          renderLabel={(p) => `${p.dose}Gy/${p.fractions}fx`}
          onRemove={(i) => removeFromPresetArray('dibh', 'boost_presets', (_, idx) => idx !== i)} />
        {!readOnly && (
          <DoseFxAdder doseKey="boostDose" fxKey="boostFx" color="teal" inputs={inputs} setInputs={setInputs}
            onAdd={(d, f) => updatePresetArray('dibh', 'boost_presets', arr => [...arr, { dose: d, fractions: f }])} />
        )}
      </SectionWrapper>

      {/* HDR Settings */}
      <SectionWrapper visKey="hdr" visibleModules={editVisibleModules} label="HDR Settings" color="orange">
        <EquipmentFields module="hdr" defaults={editFacilityDefaults} setDefaults={setEditFacilityDefaults} readOnly={readOnly}
          fields={[
            { key: 'afterloader', label: 'Afterloader' },
            { key: 'planning_system', label: 'Planning System' },
            { key: 'ct_slice_thickness', label: 'CT Slice Thickness (mm)', type: 'number', step: '0.5' },
          ]}
        />
        <Divider borderColor="gray.600" />
        <Text color="gray.300" fontSize="xs">Applicators</Text>
        <SimpleTagList items={editModulePresets?.hdr?.applicators || []} color="orange" readOnly={readOnly}
          renderLabel={(app) => `${app.type} (${app.site}${app.channels ? `, ${app.channels}ch` : ''})`}
          onRemove={(i) => removeFromPresetArray('hdr', 'applicators', (_, idx) => idx !== i)}
        />
        {!readOnly && (() => {
          const doAdd = () => {
            const type = (inputs.hdrType || '').trim();
            const site = (inputs.hdrSite || '').trim();
            if (type && site) {
              const channels = inputs.hdrChannels ? parseInt(inputs.hdrChannels) : null;
              updatePresetArray('hdr', 'applicators', arr => [...arr, { type, site, channels }]);
              setInputs(prev => ({ ...prev, hdrType: '', hdrSite: '', hdrChannels: '' }));
            }
          };
          return (
            <HStack>
              <Input value={inputs.hdrType || ''} onChange={(e) => setInputs(prev => ({ ...prev, hdrType: e.target.value }))} placeholder="Type" {...inputProps} />
              <Input value={inputs.hdrSite || ''} onChange={(e) => setInputs(prev => ({ ...prev, hdrSite: e.target.value }))} placeholder="Site" {...inputProps} />
              <Input type="number" value={inputs.hdrChannels || ''} onChange={(e) => setInputs(prev => ({ ...prev, hdrChannels: e.target.value }))} placeholder="Ch"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); doAdd(); } }} {...inputProps} />
              <AddButton color="orange" onClick={doAdd} label="Add HDR applicator" />
            </HStack>
          );
        })()}
      </SectionWrapper>

      {/* Fusion Settings */}
      <SectionWrapper visKey="fusion" visibleModules={editVisibleModules} label="Fusion Settings" color="blue">
        <Text color="gray.300" fontSize="xs">Anatomical Regions</Text>
        <SimpleTagList items={editModulePresets?.fusion?.anatomical_regions || []} color="blue" readOnly={readOnly}
          renderLabel={(r) => r.label}
          onRemove={(i) => removeFromPresetArray('fusion', 'anatomical_regions', (_, idx) => idx !== i)}
        />
        {!readOnly && (() => {
          const doAdd = () => {
            const val = (inputs.fusionRegionValue || '').trim();
            const label = (inputs.fusionRegionLabel || '').trim();
            if (val && label) {
              updatePresetArray('fusion', 'anatomical_regions', arr => [...arr, { value: val, label }]);
              setInputs(prev => ({ ...prev, fusionRegionValue: '', fusionRegionLabel: '' }));
            }
          };
          return (
            <HStack>
              <Input value={inputs.fusionRegionValue || ''} onChange={(e) => setInputs(prev => ({ ...prev, fusionRegionValue: e.target.value }))} placeholder="Value (e.g. extremity)" {...inputProps} />
              <Input value={inputs.fusionRegionLabel || ''} onChange={(e) => setInputs(prev => ({ ...prev, fusionRegionLabel: e.target.value }))} placeholder="Label (e.g. Extremity)"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); doAdd(); } }} {...inputProps} />
              <AddButton color="blue" onClick={doAdd} label="Add fusion region" />
            </HStack>
          );
        })()}
      </SectionWrapper>
    </Accordion>
  );
};

export default SettingsEditor;
