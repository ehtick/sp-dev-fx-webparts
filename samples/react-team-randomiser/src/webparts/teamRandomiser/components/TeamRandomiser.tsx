import * as React from 'react';
import { useState } from 'react';
import { PrimaryButton, Text } from '@fluentui/react';
import { ITeamRandomiserProps } from './ITeamRandomiserProps';
import { buildGroups } from '../utils/grouping';
import GroupCard from './GroupCard';
import styles from './TeamRandomiser.module.scss';

const TeamRandomiser: React.FC<ITeamRandomiserProps> = (props) => {
  const [groups, setGroups] = useState<string[][]>(() =>
    buildGroups(props.names, props.groupSize)
  );

  const shuffle = (): void => {
    setGroups(buildGroups(props.names, props.groupSize));
  };

  const hasNames = props.names.filter(n => n.trim() !== '').length > 1;

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <PrimaryButton text="Shuffle" onClick={shuffle} disabled={!hasNames} />
      </div>
      {!hasNames ? (
        <Text className={styles.empty}>
          Add names in the property pane to get started.
        </Text>
      ) : (
        <div className={styles.grid}>
          {groups.map((members, i) => (
            <GroupCard key={i} groupNumber={i + 1} members={members} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamRandomiser;
