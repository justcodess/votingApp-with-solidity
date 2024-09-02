// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

contract VotePlaces {

    address payable public constant moneyAddress = payable(0xc6E38C428C036A9824CD136137262dF3bEa00B1D);

    //VARIABLES
 
    // struct for places
    struct Place {
        string name;
        uint256 voteNumber;
    }
    // struct for users
    struct User {
        address userAddress;
        bool hasVoted;
        Place votedPlace;
    }
 
    // array of places
    Place[] public places;

    // array of users
    User[] public users;

    // hasVoted mapping
    mapping(address => bool) public hasVoted;

    // voting is active?
    bool public isVoteActive;
    address public owner;

    // onlyOwner modifier
    modifier onlyOwner() {
        require(msg.sender == owner, "It's not owner address");
        _;
    }

    modifier isVoted() {
        require(hasVoted[msg.sender] == false, "Already you voted");
        _;
    }

    // isVotingActive modifier
    modifier isVotingActive() {
        require(isVoteActive == true, "voting is done");
        _;
    }

    event Voted(address _userAddress, uint256 placeIndex, uint256 money);

    // CONSTRUCTOR
    // constructor'da owner'ı msg.sender yap (bizim senaryomuzda contractı ilk çalıştıran kişi oluyor)
    // ve constructor'da parametre olarak mekanları tutan bir string arrayi al, bu arrayde for döngüsüyle dönerek her elemanı mekanlar arrayine push'la

    constructor(string[] memory _places) {
        owner = payable(msg.sender);
        isVoteActive = true;

        for(uint256 i = 0; i < _places.length; i++) {
            places.push(Place(_places[i], 0));
        }
    }

    // FUNCTIONS
    // a voting func like a function vote()...
    function vote(uint256 voteIndex) public isVotingActive isVoted payable {
        bool isSent = moneyAddress.send(msg.value);
        require(isSent == true, "I cannot get the money");

        Place storage place = places[voteIndex];
        place.voteNumber+=1;

        users.push(User(msg.sender, true, place));
        hasVoted[msg.sender] = true;

        emit Voted(msg.sender, voteIndex, msg.value);
    }
    
    // a function that gets all locations
    function getAllPlaces() public view returns(Place[] memory) {
        return places;
    }
    
    // a function that gets winner place 
    function getWinnerPlace() public view returns(Place memory) {
        uint256 maxVoteNumber; // 0
        uint256 maxVoteIndex; // 0

        for(uint256 i = 0; i < places.length; i++) {
            if(places[i].voteNumber > maxVoteNumber) {
                maxVoteNumber = places[i].voteNumber;
                maxVoteIndex = i;
            }
        }

        return places[maxVoteIndex];
    }

    // a function that gets all users
    function getAllUsers() public view returns(User[] memory) {
        return users;
    }

    // a function that ends the vote (onlyOwner)
    function finishVote() public onlyOwner {
        if(msg.sender != owner) {
            revert("You are not owner");
        }
        isVoteActive = false;
    }

    function startVote() public onlyOwner {
        if(msg.sender != owner) {
            revert("you are not owner");
        }
        isVoteActive = true;
    }

    fallback() external payable {}
    receive() external payable {}
}