import { Carousel } from '@mantine/carousel';
import { useMediaQuery } from '@mantine/hooks';
import { createStyles, Paper, Skeleton, Title, Button, useMantineTheme, ActionIcon, useMantineColorScheme, Modal, Flex } from '@mantine/core';
import { AddProfileButton } from '../AddProfileButton/AddProfileButton';
import { Dispatch, SetStateAction, useState } from 'react';
import { IconCompass, IconTool } from '@tabler/icons';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { AttributePanel } from '../ConversationPanels/AttributePanel/AttributePanel';


const useStyles = createStyles((theme) => ({
  desktopCard: {
    height: '65vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },

  mobileCard: {
    height: 600,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    fontWeight: 900,
    color: theme.white,
    lineHeight: 1.2,
    fontSize: 32,
    marginTop: theme.spacing.xs,
  },

  category: {
    color: theme.white,
    opacity: 0.7,
    fontWeight: 700,
    textTransform: 'uppercase',
  },
}));

interface CardProps {
  profile: Profile;
  setSelectedProfile: Dispatch<SetStateAction<null|Profile>>;
}

interface CharacterPanelProps {
  profiles: Profile[];
  setSelectedProfile: Dispatch<SetStateAction<null|Profile>>;
}

function Card({ profile, setSelectedProfile }: CardProps) {
  const { classes } = useStyles();
  const mobile = useMediaQuery(`(max-width: 768px)`);

  return (
    <Paper
      shadow="md"
      p="xl"
      radius="md"
      sx={{ backgroundImage: `url(${profile.imageUrl})` }}
      className={mobile ? classes.mobileCard : classes.desktopCard}
    >
      <div>
        <Title order={3} className={classes.title}>
          {profile.name}
        </Title>
      </div>
      <Button variant="white" color="dark" onClick={() => {setSelectedProfile(profile)}}>
        {mobile ? 'Open Chat' : 'Open Profile'}
      </Button>
    </Paper>
  );
}

export function CharacterPanels({profiles, setSelectedProfile}: CharacterPanelProps) {
  const { data: session, status } = useSession();
  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: 768px)`);
  const { colorScheme } = useMantineColorScheme();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [profile, setProfile] = useState<Profile|null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const editCurrentProfile = () => {
    if(!profiles) {return;}
    setProfile(profiles[selectedIndex]);
    setModalOpen(true);
  }

  return (
    <div>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', width: '100%'}}>
        {
          profiles && profiles.length > 0 && (
            <>
              <Carousel
              style={mobile ? {width: '100%'} : {width: '95%'}}
              slideSize={"25%"}
              breakpoints={[{ maxWidth: 'sm', slideSize: '100%', slideGap: 2 }]}
              slideGap="xl"
              align="start"
              height={mobile ? 600 : 'auto'}
              orientation={mobile ? 'vertical' : 'horizontal'}
              slidesToScroll={1}
              initialSlide={selectedIndex}
              onSlideChange={(index) => {setSelectedIndex(index)}}
              loop>
                {profiles.map((item) => (
                  <Carousel.Slide key={item.name}>
                    <Card profile={item} setSelectedProfile={setSelectedProfile}/>
                  </Carousel.Slide>
                ))}
            </Carousel>
            <Modal opened={modalOpen} transition='slide-down' onClose={() => {setModalOpen(false); setProfile(null)}} withCloseButton={false}>
              <Flex style={{display: 'flex', alignItems: 'center'}}>
                <div style={{width: '100%'}}>
                    {profile && <AttributePanel profile={profile} setProfile={setProfile}/>}
                </div>
              </Flex>
            </Modal>
            </>
        )}
        { 
          profiles && profiles.length === 0 && (
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
              {!mobile && <h1 style={theme.colorScheme === 'dark' ? {color: theme.white, fontFamily: `Greycliff CF, ${theme.fontFamily}`, fontWeight: 900, fontSize: 32, lineHeight: 1.2, textAlign: 'center'} : {color: theme.black, fontFamily: `Greycliff CF, ${theme.fontFamily}`, fontWeight: 900, fontSize: 32, lineHeight: 1.2, textAlign: 'center'}}>You don't have any profiles yet.</h1>}
              <h2 style={theme.colorScheme === 'dark' ? {color: theme.white, fontFamily: `Greycliff CF, ${theme.fontFamily}`, fontWeight: 900, fontSize: 32, lineHeight: 1.2, textAlign: 'center'} : {color: theme.black, fontFamily: `Greycliff CF, ${theme.fontFamily}`, fontWeight: 900, fontSize: 32, lineHeight: 1.2, textAlign: 'center'}}>Add a profile to get started.</h2>
            </div>
          )
        }
        {
          !profiles && (
            <Carousel
            style={mobile ? {width: '100%'} : {width: '95%'}}
            slideSize={"25%"}
            breakpoints={[{ maxWidth: 'sm', slideSize: '100%', slideGap: 2 }]}
            slideGap="xl"
            align="start"
            height={mobile ? 600 : 'auto'}
            orientation={mobile ? 'vertical' : 'horizontal'}
            slidesToScroll={1}
            loop>
              {mobile ? (
                <Carousel.Slide>
                  <Skeleton height={600} />
                </Carousel.Slide>
              ):(
                [1,2,3,4].map((item) => (
                  <Carousel.Slide key={item}>
                    <Skeleton height={800} />
                  </Carousel.Slide>
                ))
              )}
          </Carousel>
          )
        }
      </div>
      <div style={{position: 'absolute', bottom: 35, right: 35}}>
        <AddProfileButton />
        {mobile && (<ActionIcon
            onClick={() => {editCurrentProfile()}}
            size={mobile ? 52 : 64}
            mb='xs'
            variant='filled'
            radius="xl"
            sx={(theme) => ({
              backgroundColor:
                theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[1],
              color: theme.colorScheme === 'dark' ? theme.colors.green[7] : theme.colors.grape[7],
            })}
          >
            {colorScheme === 'dark' ? <IconTool size={32} /> : <IconTool size={32}/> }
          </ActionIcon>
          )}
        {(status === 'authenticated' && session.user.role === 'admin') && 
          <ActionIcon
            onClick={() => {router.push('/explore')}}
            size={mobile ? 52 : 64}
            variant='filled'
            radius="xl"
            sx={(theme) => ({
              backgroundColor:
                theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[1],
              color: theme.colorScheme === 'dark' ? theme.colors.green[7] : theme.colors.grape[7],
            })}
          >
            {colorScheme === 'dark' ? <IconCompass size={32} /> : <IconCompass size={32}/> }
          </ActionIcon>
        }
      </div>
    </div>
  );
}