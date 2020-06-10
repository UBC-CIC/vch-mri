-- Initial postgres table creation script 
\c rules 

DROP TABLE IF EXISTS mri_rules; 

CREATE TABLE IF NOT EXISTS mri_rules ( 
    id SERIAL PRIMARY KEY, 
    body_part VARCHAR(32) NOT NULL, 
    text_val TEXT, 
    tokens TSVECTOR,
    priority VARCHAR(3),
    created_on TIMESTAMP
); 

SELECT * FROM mri_rules; 

INSERT INTO mri_rules(body_part, text_val, tokens, priority) VALUES 
('abdomen', 'Abscesses', to_tsvector('Abscesses'), '3A'),
('abdomen', 'Adrenal mass', to_tsvector('Adrenal mass'), '3B'),
('abdomen', 'Aneurysm (Brain and Angio)', to_tsvector('Aneurysm (Brain and Angio)'), '4'),
('abdomen', 'Appendix', to_tsvector('Appendix'), '2'),
('abdomen', 'Bowel ischemia (SBFT)', to_tsvector('Bowel ischemia (SBFT)'), '2'),
('abdomen', 'Characterization soft tissue mass, likely benign (lipoma)', to_tsvector('Characterization soft tissue mass, likely benign (lipoma)'), '3B'),
('abdomen', 'Hepatic mass – likely hemangioma FNH', to_tsvector('Hepatic mass – likely hemangioma FNH'), '3B'),
('abdomen', 'Lesions', to_tsvector('Lesions'), '3A'),
('abdomen', 'Liver Cancer staging of new (FU timed or RT)', to_tsvector('Liver Cancer staging of new (FU timed or RT)'), '3A'),
('abdomen', 'Lymphoma query', to_tsvector('Lymphoma query'), '3A'),
('abdomen', 'Metastatic workup rad to decide', to_tsvector('Metastatic workup rad to decide'), '3A'),
('abdomen', 'MRCP (query ca 3A, NYD pain 4)', to_tsvector('MRCP (query ca 3A, NYD pain 4)'), '3A'),
('abdomen', 'MRCP known', to_tsvector('MRCP known'), '4'),
('abdomen', 'Pancreas Cancer (rad review)', to_tsvector('Pancreas Cancer (rad review)'), '3A'),
('abdomen', 'Renal Cancer - Follow up', to_tsvector('Renal Cancer - Follow up'), '4'),
('abdomen', 'Renal Artery Stenosis', to_tsvector('Renal Artery Stenosis'), '4'),
('abdomen', 'Renal Cancer - Query is semi', to_tsvector('Renal Cancer - Query is semi'), '3B'),
('abdomen', 'SBFT – Chrohn’s (unless clinically Warrants sooner)', to_tsvector('SBFT – Chrohn’s (unless clinically Warrants sooner)'), '4'),
('abdomen', 'Staging of new cancer', to_tsvector('Staging of new cancer'), '3A');

INSERT INTO mri_rules(body_part, text_val, tokens, priority) VALUES 
('angio', 'Acute carotid or aortic dissection (CT equivocal)', to_tsvector('Acute carotid or aortic dissection (CT equivocal)'), '1'),
('angio', 'Critical / high grade ICA stenosis-symptom', to_tsvector('Critical / high grade ICA stenosis-symptom'), '2'),
('angio', 'Glomus Tumor-Carotids', to_tsvector('Glomus Tumor-Carotids'), '3C'),
('angio', 'MRA vascular-rest pain, Claudication', to_tsvector('MRA vascular-rest pain, Claudication'), '2'),
('angio', 'MRA vascular- gangrene', to_tsvector('MRA vascular- gangrene'), '1'),
('angio', 'Preoperative assessment of renal vascular invasion by renal cell carcinoma if ultrasound or CT is inconclusive', to_tsvector('Preoperative assessment of renal vascular invasion by renal cell carcinoma if ultrasound or CT is inconclusive'), '2'),
('angio', 'Suspected intracranial vascular lesion', to_tsvector('Suspected intracranial vascular lesion'), '2'),
('angio', 'Renal artery stenosis', to_tsvector('Renal artery stenosis'), '4'),
('angio', 'Screen Circle of Willis', to_tsvector('Screen Circle of Willis'), '4');

INSERT INTO mri_rules(body_part, text_val, tokens, priority) VALUES 
('Aortic Arch and Branches', 'Aneurysm (confirmed, enlarging, Preop) F/U Routine)', to_tsvector('Aneurysm (confirmed, enlarging, Preop) F/U Routine)'), '3C'),
('Aortic Arch and Branches', 'Co-arctation', to_tsvector('Co-arctation'), '3C'),
('Aortic Arch and Branches', 'Vascular Abnormalities', to_tsvector('Vascular Abnormalities'), '3C');

INSERT INTO mri_rules(body_part, text_val, tokens, priority) VALUES 
('Brain / Head', 'Acoustic neuroma Known', to_tsvector('Acoustic neuroma Known'), '4'),
('Brain / Head', 'Acoustic neuroma Query ', to_tsvector('Acoustic neuroma Query '), '3C'),
('Brain / Head', 'Acute stroke (CT preferred as initial investigation)', to_tsvector('Acute stroke (CT preferred as initial investigation)'), '1'),
('Brain / Head', 'Aneurysm (Initial)', to_tsvector('Aneurysm (Initial)'), '3A'),
('Brain / Head', 'Aneurysm (F/U or screening)', to_tsvector('Aneurysm (F/U or screening)'), '4'),
('Brain / Head', 'Any acute hydrocephalus if MRI needed for RX planning (i.e. ventriculostomy)', to_tsvector('Any acute hydrocephalus if MRI needed for RX planning (i.e. ventriculostomy)'), '1'),
('Brain / Head', 'Arachnoid cyst ', to_tsvector('Arachnoid cyst '), '4'),
('Brain / Head', 'Arachnoiditis', to_tsvector('Arachnoiditis'), '3A'),
('Brain / Head', 'Arteriovenus malformation (known 3A/Screen)', to_tsvector('Arteriovenus malformation (known 3A/Screen)'), '3A'),
('Brain / Head', 'Arteriovenus malformation (f/u)', to_tsvector('Arteriovenus malformation (f/u)'), '4'),
('Brain / Head', 'Asymmetic sensorineural hearing loss', to_tsvector('Asymmetic sensorineural hearing loss'), '4'),
('Brain / Head', 'Ataxic gait', to_tsvector('Ataxic gait'), '4'),
('Brain / Head', 'Cavernous Malformations (Screen or f/u)', to_tsvector('Cavernous Malformations (Screen or f/u)'), '4'),
('Brain / Head', 'Characterization soft tissue mass -likely benign (lipoma)', to_tsvector('Characterization soft tissue mass -likely benign (lipoma)'), '3B'),
('Brain / Head', 'Cognitive change', to_tsvector('Cognitive change '), '4'),
('Brain / Head', 'Congenital brain/spine abnormality which is symptomatic', to_tsvector('Congenital brain/spine abnormality which is symptomatic'), '3C'),
('Brain / Head', 'Grand Mal Seizures, History of', to_tsvector('Grand Mal Seizures, History of'), '4'),
('Brain / Head', 'Grand Mal Seizures, New ', to_tsvector('Grand Mal Seizures, New '), '4'),
('Brain / Head', 'Head venogram ? new clot benign intracranial hypertention (Tech/Rad review)', to_tsvector('Head venogram ? new clot benign intracranial hypertention (Tech/Rad review)'), '2'),
('Brain / Head', 'Increased Prolactin level PIT)', to_tsvector('Increased Prolactin level PIT)'), '3C'),
('Brain / Head', 'Intracranial hemorrhage- assessment of underlying lesion', to_tsvector('Intracranial hemorrhage- assessment of underlying lesion'), '1'),
('Brain / Head', 'Ischemic optic Neuropathy', to_tsvector('Ischemic optic Neuropathy'), '3C'),
('Brain / Head', 'Meningioma- Follow up', to_tsvector('Meningioma- Follow up'), '4'),
('Brain / Head', 'Meningioma- initial workup', to_tsvector('Meningioma- initial workup'), '3B'),
('Brain / Head', 'Metastatic workup', to_tsvector('Metastatic workup'), '3A'),
('Brain / Head', 'MS - Follow up known, ? Query new lesion', to_tsvector('MS - Follow up known, ? Query new lesion'), '4'),
('Brain / Head', 'MS - Rule out PML', to_tsvector('MS - Rule out PML'), '3B'),
('Brain / Head', 'MS-Initial diagnosis', to_tsvector('MS-Initial diagnosis'), '3B'),
('Brain / Head', 'Neurodegenerative/ dementia', to_tsvector('Neurodegenerative/ dementia'), '4'),
('Brain / Head', 'Neurofibroma ', to_tsvector('Neurofibroma '), '3C'),
('Brain / Head', 'Optic Atrophy', to_tsvector('Optic Atrophy'), '3C'),
('Brain / Head', 'Optic Neuritis or Neuropathy', to_tsvector('Optic Neuritis or Neuropathy'), '3C'),
('Brain / Head', 'Orbital Lesion', to_tsvector('Orbital Lesion'), '3A'),
('Brain / Head', 'Pituitary adenoma suspected', to_tsvector('Pituitary adenoma suspected'), '3B'),
('Brain / Head', 'Post concussion syndrome', to_tsvector('Post concussion syndrome'), '4'),
('Brain / Head', 'Preoperative evaluation of posterior fossa neoplasm, deep supratentorial neoplam, or exclusion of additional metastatic lesions, if CT does not answer these questions.', to_tsvector('Preoperative evaluation of posterior fossa neoplasm, deep supratentorial neoplam, or exclusion of additional metastatic lesions, if CT does not answer these questions.'), '1'),
('Brain / Head', 'Pulsatile tinnitus or tinnitus ', to_tsvector('Pulsatile tinnitus or tinnitus '), '4'),
('Brain / Head', 'Retrocochlear disease', to_tsvector('Retrocochlear disease '), '4'),
('Brain / Head', 'Seizures (followup)', to_tsvector('Seizures (followup)'), '4'),
('Brain / Head', 'Seizures NEW symptoms', to_tsvector('Seizures NEW symptoms'), '3A'),
('Brain / Head', 'Skull base and nasopharyngeal tumours- for further localizaton and surgical planning', to_tsvector('Skull base and nasopharyngeal tumours- for further localizaton and surgical planning'), '3A'),
('Brain / Head', 'Skull base and nasopharyngeal tumours- for further localizaton and surgical planning (if tumor invading ASAP Priority 2)', to_tsvector('Skull base and nasopharyngeal tumours- for further localizaton and surgical planning (if tumor invading ASAP Priority 2)'), '2'),
('Brain / Head', 'Space occupying lesion (SOL) Known', to_tsvector('Space occupying lesion (SOL) Known'), '3A'),
('Brain / Head', 'Staging of new cancer', to_tsvector('Staging of new cancer'), '3A'),
('Brain / Head', 'Suspected encephalitis or abscess', to_tsvector('Suspected encephalitis or abscess'), '1'),
('Brain / Head', 'TMJ RJH only', to_tsvector('TMJ RJH only'), '4'),
('Brain / Head', 'TMJ (locked-then semi urgent 3A) RJH only', to_tsvector('TMJ (locked-then semi urgent 3A) RJH only'), '3A');

INSERT INTO mri_rules(body_part, text_val, tokens, priority) VALUES 
('Breast', 'Breast implants Usually looking for a leak', to_tsvector('Breast implants Usually looking for a leak'), '4'),
('Breast', 'Breast- residual/recurrent disease post Tx', to_tsvector('Breast- residual/recurrent disease post Tx'), '3A'),
('Breast', 'Characterization soft tissue mass- likely benign (lipoma)', to_tsvector('Characterization soft tissue mass- likely benign (lipoma)'), '3B'),
('Breast', 'Metastatic workup', to_tsvector('Metastatic workup'), '3A'),
('Breast', 'Workup of new breast carcinoma', to_tsvector('Workup of new breast carcinoma'), '2');

INSERT INTO mri_rules(body_part, text_val, tokens, priority) VALUES 
('Cardiac', 'Cardiac ‐ ARVD', to_tsvector('Cardiac ‐ ARVD'), '2'),
('Cardiac', 'Cardiac ‐ viability assessment or mass', to_tsvector('Cardiac ‐ viability assessment or mass'), '2');

INSERT INTO mri_rules(body_part, text_val, tokens, priority) VALUES 
('Chest', 'Characterization soft tissue mass- likely benign (lipoma)', to_tsvector('Characterization soft tissue mass- likely benign (lipoma)'), '3B'),
('Chest', 'Metastatic workup', to_tsvector('Metastatic workup'), '3A'),
('Chest', 'Pancoast tumour', to_tsvector('Pancoast tumour'), '3A'),
('Chest', 'Staging of new cancer ', to_tsvector('Staging of new cancer '), '3A');

INSERT INTO mri_rules(body_part, text_val, tokens, priority) VALUES 
('Neck', 'Characterization soft tissue mass- likely benign (lipoma)', to_tsvector('Characterization soft tissue mass- likely benign (lipoma)'), '3B'),
('Neck', 'Metastatic workup', to_tsvector('Metastatic workup'), '3A'),
('Neck', 'Skull base and nasopharyngeal tumours ‐ for further localization and surgical planning', to_tsvector('Skull base and nasopharyngeal tumours ‐ for further localization and surgical planning'), '2'),
('Neck', 'Staging of new cancer (thyroid)', to_tsvector('Staging of new cancer (thyroid)'), '3A');

INSERT INTO mri_rules(body_part, text_val, tokens, priority) VALUES 
('Pelvis', 'Anal Fistula', to_tsvector('Anal Fistula'), '4'), 
('Pelvis', 'Cervical cancer follow up', to_tsvector('Cervical cancer follow up'), '4'), 
('Pelvis', 'Cervix Cancer staging', to_tsvector('Cervix Cancer staging'), '3A'), 
('Pelvis', 'Fibroids', to_tsvector('Fibroids'), '4'), 
('Pelvis', 'Metastatic workup', to_tsvector('Metastatic workup'), '3A'), 
('Pelvis', 'Prostate CA', to_tsvector('Prostate CA'), '3B'), 
('Pelvis', 'Rectal carcinoma - new diagnosis or staging', to_tsvector('Rectal carcinoma - new diagnosis or staging'), '2'), 
('Pelvis', 'Rule out Seminoma (met)', to_tsvector('Rule out Seminoma (met)'), '3A'), 
('Pelvis', 'Staging of new cancer', to_tsvector('Staging of new cancer'), '3A');

INSERT INTO mri_rules(body_part, text_val, tokens, priority) VALUES
('Spine', 'Acute osteomyelitis', to_tsvector('Acute osteomyelitis'), '1'), 
('Spine', 'Characterization soft tissue mass-likely benign (lipoma)', to_tsvector('Characterization soft tissue mass-likely benign (lipoma)'), '3B'), 
('Spine', 'Chronic osteomyelitis', to_tsvector('Chronic osteomyelitis'), '2'), 
('Spine', 'Chronic spine pain', to_tsvector('Chronic spine pain'), '4'), 
('Spine', 'Evaluation of spinal cord injury in acute trauma if no bony abnormality is noted, to assess cord injury of compression', to_tsvector('Evaluation of spinal cord injury in acute trauma if no bony abnormality is noted, to assess cord injury of compression'), '1'), 
('Spine', 'Foot Drop', to_tsvector('Foot Drop'), '3A'),
('Spine', 'Foot Drop query Tumor', to_tsvector('Foot Drop query Tumor'), '2'), 
('Spine', 'Metastatic workup', to_tsvector('Metastatic workup'), '3A'), 
('Spine', 'Myelopathy', to_tsvector('Myelopathy'), '2'), 
('Spine', 'Neurofibroma', to_tsvector('Neurofibroma'), '3A'),
('Spine', 'Neurofibromatosis (follow up)', to_tsvector('Neurofibromatosis (follow up)'), '4'), 
('Spine', 'Preoperative evaluation of spinal cord neoplasm', to_tsvector('Preoperative evaluation of spinal cord neoplasm'), '1'), 
('Spine', 'Staging of new cancer', to_tsvector('Staging of new cancer'), '3A'), 
('Spine', 'Sciatica /radiculopathy', to_tsvector('Sciatica /radiculopathy'), '4'), 
('Spine', 'SI joints (rheumatology referral only)', to_tsvector('SI joints (rheumatology referral only)'), '4'),
('Spine', 'Spine Lesion', to_tsvector('Spine Lesion'), '3A'), 
('Spine', 'Spine Query cord impingement', to_tsvector('Spine Query cord impingement'), '2'), 
('Spine', 'Spine root compression -poss mass', to_tsvector('Spine root compression -poss mass'), '3A'), 
('Spine', 'Suspicion of spinal osteomyelitis', to_tsvector('Suspicion of spinal osteomyelitis'), '2'), 
('Spine', 'Syrinx (query)', to_tsvector('Syrinx (query)'), '3B'),
('Spine', 'Syrinx (follow up)', to_tsvector('Syrinx (follow up)'), '4'), 
('Spine', 'Urinary / bowel incontinence, HX that goes along with a Lumbar spine', to_tsvector('Urinary / bowel incontinence, HX that goes along with a Lumbar spine'), '2');


