import { useEffect, useState, useContext, useRef } from 'react';
import { useTheme, Box, Stack, Avatar, Typography, TextField, IconButton, List, ListItem, ListItemText, ListItemIcon, ListItemButton, Icon, RadioGroup, Radio } from '@mui/material';
import {Edit } from '@mui/icons-material';
import { Navigate, useNavigate } from 'react-router-dom';
import { SessionContext, HostContext } from '../../util/contexts';
import LoadingButton from '@mui/lab/LoadingButton';
import formvalidation from '../../util/formvalidation';
import validator from 'validator'
import Dashboard from '../../components/dashboard/Dashboard';
import Loading from '../../components/Loading';

import CourtImage from './courtplaceholder.jpg';

function Courtcreate(props) {
    const [formdata, setFormdata] = useState({
        name: { value: '', err: true, touched: false },
        about: { value: '', err: true, touched: false  },
        address: { value: '', err: true, touched: false  },
        sport: { value: 1, err: false, touched: false }
    });
    const [formvalid, setFormvalid] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [userdata, setUserdata] = useState(null);
    const [isOrganizer, setIsOrganizer] = useState(false);
    
    const [avatarEdit, setAvatarEdit] = useState(false);
    const [avatarSelection, setAvatarSelection] = useState(null);

    const avatarBrowser = useRef(null);
	const navigate = useNavigate();
	const theme = useTheme();

	const session_uid = useContext(SessionContext);

    const formValidateEffect = formvalidation.formValidateEffect.bind(null, formdata, setFormvalid);
    const onChangeHandler = formvalidation.onChangeHandler.bind(null, formdata, setFormdata);
    const inErrorState = formvalidation.inErrorState.bind(null, formdata);

    const [sports, setSports] = useState({});

    // Backend
    const hostname = useContext(HostContext);

    function fetchUserdata() {
		if (session_uid === null)
			return;

		fetch(hostname + 'userdata/fetchpublic?id=' + session_uid, {
			method: 'GET'
		}).then(response => {
			if (response.ok) {
				response.json().then((json) => {
                    for (let i = 0; i < json.types.length; ++i)
                    {
                        // 4 é organizador
                        if (json.types[i] === 4)
                        {
                            setIsOrganizer(true);
                            break;
                        }
                    }
                    setUserdata(json);
                });
			} else if (response.status === 404) {
				navigate('/user');
			}
		});
	}

    function fetchDatafields()
    {
        fetch(hostname + 'datafields/sports', {
            method: 'GET'
        }).then(response => {
            if (response.ok) { 
                response.json().then((json) => {
                    setSports(json);
                });
            }
        });
    }

    function createCourtdata()
    {
        setIsLoading(true);

        const formData = new FormData();
        formData.append("sport", formdata.sport.value);
        formData.append("title", formdata.name.value);
        formData.append("subtitle", formdata.about.value);
        formData.append("address", formdata.address.value);

        if (avatarSelection !== null)
            formData.append("avatar", avatarSelection);
            
        fetch(hostname + 'courtdata/create', {
            method: 'POST',
            credentials: 'include',
            body: formData
        }).then(response => {
            setIsLoading(false);
            if (response.ok) { 
                response.text().then(text => navigate('/courts/'));
            }
            // TODO checagem de erros mínima
        });
    }

	/*eslint-disable */
	useEffect(() => {fetchUserdata(); fetchDatafields();}, [session_uid]);
    useEffect(formValidateEffect, [formdata]);
	/*eslint-enable */

	if (userdata && sports.length > 0)
	{
        if (!isOrganizer)
            return(<Navigate to="/courts" />);
           
		return (
			<Box sx={{height: '100%', width:'100%', display: 'flex'}}>
				<Dashboard useDefault={true} />

				<Stack direction="column" sx={{padding: '2rem', paddingTop: '0', flexGrow: 1, overflowWrap: 'break-all', alignItems: 'center' }}>

                    <Typography fontWeight="bold" variant="h4" component="div" sx={{marginY: '1rem', color: theme.palette.common.white}}>
                        <p>Cadastrar local esportivo</p>
                    </Typography>
					
                    <Box display="flex" justifyContent="center" flexWrap="wrap" alignItems="center" spacing="1em" sx={{maxWidth: '75%'}}>

                    <IconButton sx={{borderRadius: '0.25em'}} variant="rounded" onClick={()=> avatarBrowser.current.click()} onMouseEnter={() => setAvatarEdit(true)} onMouseLeave={() => setAvatarEdit(false)}>
                        <Avatar
                            variant="rounded"
                            src={avatarSelection !== null ? URL.createObjectURL(avatarSelection) : CourtImage}
                            sx={{width: '18em', height: '5em'}}
                        />
                        <Edit sx={{position: 'absolute', display: avatarEdit ? 'auto' : 'none'}} />
                        <input
                            ref={avatarBrowser}
                            onChange={(event) => setAvatarSelection(event.target.files[0])}
                            type="file"
                            accept="image/*"
                            hidden
                        />
                    </IconButton>

                        <TextField label="Nome" variant="standard" sx={{width: '24rem', paddingBottom: '1em', ml: '1em'}}
                            value={formdata.name.value} onChange={ (event) => onChangeHandler('name', event.target.value, (value) => validator.isLength(value, {min: 4, max: 64} ) ) }
                            error={inErrorState('name')} helperText={inErrorState('name') ? 'O nome deve conter entre 4 e 64 caracteres' : ''} />
                    </Box>


					<Typography fontSize="1.125rem" component="div" letterSpacing="0.06em">
						<p>Sobre</p>
					</Typography>

                    <TextField sx={{minWidth: '18rem', width: '40%'}}
                        label="Complemento"
                        placeholder="Nome complementar de seu local"
                        rows={6}
                        value={formdata.about.value}
                        onChange={ (event) => onChangeHandler('about', event.target.value, (value) => validator.isLength(value, {min: 4, max: 64} ) ) }
                        error={inErrorState('about')}
                        helperText={inErrorState('about') ? 'O complemento deve conter entre 4 e 64 caracteres' : ''}
                    />

                    <TextField sx={{minWidth: '18rem', width: '40%', mt: '1.5em'}}
                        label="Endereço"
                        placeholder="Localização"
                        rows={6}
                        value={formdata.address.value}
                        onChange={ (event) => onChangeHandler('address', event.target.value, (value) => validator.isLength(value, {min: 8, max: 256} ) ) }
                        error={inErrorState('address')}
                        helperText={inErrorState('address') ? 'O endereço deve conter entre 8 e 256 caracteres' : ''}
                    />

                    <Box display="flex" gap="2em" flexWrap="wrap" justifyContent="center">
                        <Stack sx={{alignItems: 'center'}}>
                            <Typography fontSize="1.125rem" component="div" letterSpacing="0.06em">
                                <p>Esporte</p>
                            </Typography>

                            <List sx={{ maxHeight: '12em', width: '18em', bgcolor: 'background.overlay', overflowY: 'scroll', overflowX: 'hidden', borderRadius: '0.5em' }}>
                                <RadioGroup value={formdata.sport.value}>
                                    {Object.keys(sports).map((key) => {
                                        const labelId = 'radio-sports-label-' + sports[key].id;

                                        return (
                                        <ListItem
                                            key={key}
                                            secondaryAction={
                                            <IconButton edge="end" aria-label="comments">
                                                <Icon>{sports[key].mui_icon}</Icon>
                                            </IconButton>
                                            }
                                            disablePadding >
                                            <ListItemButton role={undefined} onClick={() => onChangeHandler('sport', sports[key].id) }>
                                            <ListItemIcon>
                                                <Radio
                                                    value={sports[key].id}
                                                    edge="start"
                                                    disableRipple
                                                    inputProps={{ 'aria-labelledby': labelId }}
                                                    onClick={(event) => onChangeHandler('sport', event.target.value) }
                                                />
                                            </ListItemIcon>
                                            <ListItemText id={labelId} primary={sports[key].title} />
                                            </ListItemButton>
                                        </ListItem>
                                        );
                                    })}
                                </RadioGroup>
                            </List>
            
                        </Stack>
                    </Box>
                    <LoadingButton loading={isLoading} onClick={createCourtdata} endIcon={<Edit />} sx={{marginTop: '2em'}} disabled={!formvalid} size="large" variant="contained">salvar alterações</LoadingButton>
				</Stack>
			</Box>
		);
	}
	else
        return (<Loading />)
}

export default Courtcreate;
