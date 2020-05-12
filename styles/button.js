import { StyleSheet } from 'react-native';

const buttonStyles = StyleSheet.create({
  regularButton: {
    backgroundColor: '#0047B9',
    width: '50%',
    alignSelf: 'center',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    borderColor: 'darkblue',
    borderWidth: 2,
    paddingHorizontal: 7
  },
  disabledButton: {
    backgroundColor: 'lightgrey',
    width: '50%',
    alignSelf: 'center',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    borderColor: 'darkblue',
    borderWidth: 2,
    paddingHorizontal: 7
  },
  regularButtonText: {
    fontFamily: 'Gill Sans',
    fontSize: 20,
    alignSelf: 'center',
    textAlign: 'center',
    color: 'white',
    marginHorizontal: 7,
    marginVertical: 8,
    fontWeight: 'bold'
  }
});

export default buttonStyles;
